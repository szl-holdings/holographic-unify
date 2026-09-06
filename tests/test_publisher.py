# SPDX-License-Identifier: Apache-2.0
"""Offline behavior tests for the actual publisher; no provider writes or tokens."""
import copy
import hashlib
import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
p = load('publisher', ROOT / 'scripts/publish_space.py')
s = load('runtime_server', ROOT / 'space/server.py')
A, B, C = 'a' * 40, 'b' * 40, 'c' * 40


class SourceTests(unittest.TestCase):
    def git(self, *args):
        return {('status', '--porcelain', '--untracked-files=normal'): '',
                ('remote', 'get-url', 'origin'): 'https://github.com/' + p.SOURCE_REPOSITORY,
                ('rev-parse', 'HEAD'): A,
                ('branch', '--show-current'): 'main',
                ('ls-remote', '--exit-code', 'origin', 'refs/heads/main'): A + '\trefs/heads/main'}[args]

    def action_env(self):
        return {'GITHUB_ACTIONS': 'true', 'GITHUB_REPOSITORY': p.SOURCE_REPOSITORY,
                'GITHUB_REF': 'refs/heads/main', 'GITHUB_EVENT_NAME': 'push', 'GITHUB_SHA': A}

    def test_detached_event_checkout_is_valid(self):
        with patch.object(p, 'git', side_effect=self.git), patch.dict(os.environ, self.action_env(), clear=True):
            self.assertEqual(p.exact_main(), A)

    def test_local_main_is_supported(self):
        with patch.object(p, 'git', side_effect=self.git), patch.dict(os.environ, {}, clear=True):
            self.assertEqual(p.exact_main(), A)

    def test_foreign_fork_pr_ref_event_and_revision_are_rejected(self):
        for key, value in [('GITHUB_REPOSITORY', 'other/repo'), ('GITHUB_REF', 'refs/pull/1/merge'),
                           ('GITHUB_EVENT_NAME', 'pull_request'), ('GITHUB_SHA', B), ('GITHUB_SHA', 'main')]:
            env = {**self.action_env(), key: value}
            with self.subTest(key=key), patch.object(p, 'git', side_effect=self.git), patch.dict(os.environ, env, clear=True):
                with self.assertRaises(p.PublicationError): p.exact_main()

    def test_dirty_stale_and_foreign_origin_are_rejected(self):
        for command, value in [(('status', '--porcelain', '--untracked-files=normal'), ' M index.html'),
                               (('remote', 'get-url', 'origin'), 'https://wrong.invalid/repo'),
                               (('ls-remote', '--exit-code', 'origin', 'refs/heads/main'), B+'\trefs/heads/main'),
                               (('ls-remote', '--exit-code', 'origin', 'refs/heads/main'), A+'\trefs/heads/other')]:
            with self.subTest(command=command), patch.object(p, 'git', side_effect=lambda *a: value if a == command else self.git(*a)), patch.dict(os.environ, self.action_env(), clear=True):
                with self.assertRaises(p.PublicationError): p.exact_main()

    def test_unavailable_git_is_bounded_and_value_free(self):
        with patch.object(p.subprocess, 'run', side_effect=OSError('sensitive-value')):
            with self.assertRaisesRegex(p.PublicationError, '^GIT_UNAVAILABLE$'): p.git('rev-parse', 'HEAD')

    def test_sha_parser_rejects_short_refs_and_types(self):
        for value in ('main', 'a'*39, 'A'*40, 17, None):
            with self.subTest(value=value), self.assertRaises(p.PublicationError): p.exact_sha(value)


class PayloadTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        for name in p.PAYLOAD_FILES: (self.root / name).write_bytes(name.encode())
        self.override = patch.object(p, 'SPACE', self.root)
        self.override.start()
    def tearDown(self): self.override.stop(); self.temp.cleanup()

    def test_payload_includes_bound_manifest_not_self_referential_hash(self):
        files = p.payload(A)
        d = json.loads(files['deployment.json'])
        self.assertEqual(d['source'], {'repository': p.SOURCE_REPOSITORY, 'revision': A})
        self.assertEqual({r['path'] for r in d['files']}, p.PAYLOAD_FILES)
        self.assertFalse(d['claims']['execution_authority'])

    def test_unexpected_missing_and_symlink_payloads_reject(self):
        (self.root/'extra').write_text('x')
        with self.assertRaises(p.PublicationError): p.payload(A)
        (self.root/'extra').unlink(); (self.root/'index.html').unlink()
        with self.assertRaises(p.PublicationError): p.payload(A)
        (self.root/'index.html').symlink_to('server.py')
        with self.assertRaises(p.PublicationError): p.payload(A)

    def test_oversize_payload_is_rejected(self):
        with patch.object(p, 'MAX_BYTES', 1), self.assertRaises(p.PublicationError): p.payload(A)

    def test_manifest_serves_exact_bytes_only_when_all_files_match(self):
        files = p.payload(A); (self.root/'deployment.json').write_bytes(files['deployment.json'])
        with patch.object(s, 'HERE', self.root):
            self.assertEqual(s.deployment_bytes(), (files['deployment.json'], A))
            (self.root/'server.py').write_text('changed')
            with self.assertRaises(ValueError): s.deployment_bytes()

    def test_runtime_rejects_foreign_target_duplicate_and_traversal(self):
        baseline = json.loads(p.payload(A)['deployment.json'])
        cases = []
        d = copy.deepcopy(baseline); d['source']['repository'] = 'other/repo'; cases.append(d)
        d = copy.deepcopy(baseline); d['target']['repo_id'] = 'SZLHOLDINGS/szl-constellation'; cases.append(d)
        d = copy.deepcopy(baseline); d['files'][0]['path'] = '../other'; cases.append(d)
        d = copy.deepcopy(baseline); d['files'][0] = d['files'][1]; cases.append(d)
        for d in cases:
            (self.root/'deployment.json').write_bytes(p.encoded(d))
            with patch.object(s, 'HERE', self.root), self.assertRaises(ValueError): s.deployment_bytes()
        with self.assertRaises(ValueError): s.strict_object([('x',1),('x',2)])


class FakeProvider:
    def __init__(self):
        self.sha = B; self.commits = []; self.store = {}; self.stage = 'RUNNING'
        self.initial_files = ['.gitattributes']
        self.sdk = 'docker'; self.target = p.SPACE_ID
    def space_info(self, target):
        return SimpleNamespace(id=self.target, sdk=self.sdk, sha=self.sha,
                               runtime={'stage': self.stage, 'sha': self.sha})
    def list_repo_files(self, target, **kw):
        return self.initial_files if kw['revision'] == B else list(self.store)
    def create_commit(self, **kw):
        self.commits.append(kw)
        self.store = {o['path_in_repo']: o['path_or_fileobj'] for o in kw['operations']}
        self.sha = C
        return SimpleNamespace(oid=C)
    def download(self, name, rev):
        return b'preserved attrs' if name == '.gitattributes' else self.store[name]


class ProviderTests(unittest.TestCase):
    def setUp(self):
        self.api = FakeProvider(); self.receipt = {'status':'ADMITTED'}; self.saved = []
        self.files = {'index.html': b'html', 'server.py': b'server', 'deployment.json': b'{"source":"pinned"}'}
    def read(self, path):
        return {'/': b'html', '/deployment.json': self.files['deployment.json'],
                '/healthz': p.encoded({'ok':True, 'github':p.SOURCE_REPOSITORY, 'canonical_space':p.SPACE_ID})}[path]
    def execute(self, **kw):
        p.publication(self.api, kw.pop('download',self.api.download), lambda **a:a,
                      dict(self.files), A, self.receipt,
                      lambda:self.saved.append(copy.deepcopy(self.receipt)),
                      kw.pop('fresh',lambda:A), read=kw.pop('read',self.read),
                      timeout=kw.pop('timeout',1), sleep=lambda _:None, **kw)

    def test_one_atomic_commit_is_bound_to_parent_and_read_back(self):
        self.execute()
        self.assertEqual(len(self.api.commits),1)
        self.assertEqual(self.api.commits[0]['parent_commit'], B)
        self.assertEqual(self.api.commits[0]['revision'],'main')
        self.assertEqual(self.receipt['status'],'RUNTIME_VERIFIED')
        self.assertEqual(self.api.store['.gitattributes'], b'preserved attrs')
        self.assertEqual([v['status'] for v in self.saved],
                         ['COMMIT_ATTEMPTED','PROVIDER_COMMITTED','PROVIDER_VERIFIED','RUNTIME_VERIFIED'])

    def test_missing_target_is_not_created(self):
        self.api.space_info=lambda _: (_ for _ in ()).throw(OSError('missing target'))
        with self.assertRaises(OSError): self.execute()
        self.assertEqual(self.api.commits,[])

    def test_gradio_or_other_target_never_receives_docker_payload(self):
        for attr, value in [('sdk','gradio'), ('target','SZLHOLDINGS/szl-constellation')]:
            self.api = FakeProvider(); setattr(self.api,attr,value)
            with self.subTest(attr=attr), self.assertRaises(p.PublicationError): self.execute()
            self.assertEqual(self.api.commits,[])

    def test_unowned_files_are_not_deleted(self):
        self.api.initial_files=['user-data.json']
        with self.assertRaisesRegex(p.PublicationError,'UNOWNED_PROVIDER_FILES'): self.execute()
        self.assertEqual(self.api.commits,[])

    def test_source_advance_before_commit_stops_write(self):
        with self.assertRaisesRegex(p.PublicationError,'SOURCE_MOVED_BEFORE_COMMIT'): self.execute(fresh=lambda:B)
        self.assertEqual(self.api.commits,[])

    def test_failed_commit_retains_unknown_outcome_phase(self):
        def fail(**kw): raise TimeoutError('provider response')
        self.api.create_commit=fail
        with self.assertRaises(TimeoutError): self.execute()
        self.assertEqual(self.saved[-1]['status'],'COMMIT_ATTEMPTED')

    def test_provider_tamper_never_becomes_verified(self):
        with self.assertRaisesRegex(p.PublicationError,'PROVIDER_BYTES_MISMATCH'):
            self.execute(download=lambda n,r: b'wrong' if r == C else b'preserved attrs')
        self.assertEqual(self.saved[-1]['status'],'PROVIDER_COMMITTED')

    def test_runtime_wrong_root_or_deployment_never_passes(self):
        for wrong in ['/', '/deployment.json']:
            self.setUp()
            with self.subTest(path=wrong), self.assertRaises(p.PublicationError):
                self.execute(read=lambda path: b'wrong' if path==wrong else self.read(path))
            self.assertEqual(self.saved[-1]['status'],'PROVIDER_VERIFIED')

    def test_runtime_timeout_cannot_promote_provider_verified(self):
        self.api.stage='BUILDING'
        with self.assertRaisesRegex(p.PublicationError,'RUNTIME_TIMEOUT'): self.execute(timeout=.001)
        self.assertEqual(self.saved[-1]['status'],'PROVIDER_VERIFIED')

    def test_terminal_runtime_stops_polling(self):
        self.api.stage='RUNTIME_ERROR'
        with self.assertRaisesRegex(p.PublicationError,'RUNTIME_TERMINAL'): self.execute()

    def test_source_advance_after_commit_cannot_be_current_release(self):
        seq=iter([A,B])
        with self.assertRaisesRegex(p.PublicationError,'SOURCE_SUPERSEDED_AFTER_PUBLICATION'):
            self.execute(fresh=lambda:next(seq))
        self.assertEqual(self.saved[-1]['status'],'PROVIDER_VERIFIED')

    def test_runtime_redirect_is_refused(self):
        with self.assertRaises(p.PublicationError):
            p.NoRedirect().redirect_request(None,None,302,'',{},'https://elsewhere.invalid')


class ReceiptTests(unittest.TestCase):
    def test_receipt_is_atomic_and_hash_verifies(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'receipt.json'; p.write_receipt(path,{'status':'FAILED'})
            value=json.loads(path.read_bytes()); digest=value.pop('receipt_sha256')
            self.assertEqual(digest,hashlib.sha256(p.encoded(value)).hexdigest())
            self.assertEqual(len(list(Path(d).iterdir())),1)

    def test_receipt_symlink_is_refused(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'receipt.json'; path.symlink_to(Path(d)/'other')
            with self.assertRaises(p.PublicationError):p.write_receipt(path,{'status':'FAILED'})


if __name__ == '__main__': unittest.main(verbosity=2)
