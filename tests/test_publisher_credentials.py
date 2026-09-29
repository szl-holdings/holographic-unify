# SPDX-License-Identifier: Apache-2.0
"""Credential wiring contracts; synthetic values only, no credential readback."""
import contextlib
import importlib.util
import io
import json
import os
import re
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location('credential_test_publisher',ROOT/'scripts/publish_space.py')
p=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(p)
WORKFLOW=ROOT/'.github/workflows/deploy-hf-space.yml'


class CredentialContracts(unittest.TestCase):
    def test_exactly_one_secret_name_reaches_the_publication_step(self):
        workflow=WORKFLOW.read_text()
        before,after=workflow.split('      - name: Publish existing target and verify immutable provider and running bytes\n',1)
        step,remaining=after.split('      - name: Retain explicit pre-publisher failure\n',1)
        self.assertNotIn('secrets.',before)
        self.assertNotIn('secrets.',remaining)
        # One name and no alias chain (plan decision D5): a missing secret fails closed.
        self.assertIn('HF_TOKEN: ${{ secrets.HF_ORG_TOKEN }}\n',step)
        self.assertEqual(re.findall(r'secrets\.([A-Z_0-9]+)',workflow),['HF_ORG_TOKEN'])
        self.assertNotIn('||',step)
        self.assertNotIn('github.token',step)
        self.assertNotIn('inputs.',step)
        self.assertNotIn('secrets: inherit',workflow)

    def test_offline_source_qualification_precedes_credential_use(self):
        workflow=WORKFLOW.read_text()
        self.assertLess(workflow.index('python -I -B scripts/verify_publisher_workflow.py'),
                        workflow.index('HF_TOKEN:'))
        self.assertIn("github.ref == 'refs/heads/main'",workflow)
        self.assertIn('cancel-in-progress: false',workflow)
        self.assertIn('      - tests/test_*.py',workflow)
        self.assertNotIn('echo "$HF_TOKEN"',workflow)

    def test_workflow_holds_the_per_asset_hub_lock(self):
        workflow=WORKFLOW.read_text()
        # Plan decision D3: one lock per Hub asset, never keyed by event or ref.
        self.assertIn('concurrency:\n  group: hf-write/space/SZLHOLDINGS/holographic-unify\n'
                      '  cancel-in-progress: false\n',workflow)
        self.assertEqual(workflow.count('group:'),1)

    def test_local_apply_is_refused_before_source_or_credential_use(self):
        with tempfile.TemporaryDirectory() as d:
            env={'RUNNER_TEMP':d,'HF_TOKEN':'synthetic-do-not-transmit'}
            with patch.dict(os.environ,env,clear=True), patch.object(sys,'argv',['publisher','--apply']), \
                 patch.object(p,'exact_main') as source, patch.object(p,'publication') as publish, \
                 contextlib.redirect_stdout(io.StringIO()) as stdout:
                code=p.main()
            receipt=json.loads((Path(d)/'szl-holographic-receipt.json').read_text())
        source.assert_not_called()
        publish.assert_not_called()
        self.assertEqual(code,1)
        self.assertEqual(receipt['error_code'],'APPLY_REQUIRES_COMMITTED_WORKFLOW')
        self.assertNotIn('source_revision',receipt)
        self.assertNotIn('synthetic-do-not-transmit',json.dumps(receipt)+stdout.getvalue())

    def missing_run(self,extra):
        with tempfile.TemporaryDirectory() as d:
            env={'RUNNER_TEMP':d,'GITHUB_ACTIONS':'true',**extra}
            with patch.dict(os.environ,env,clear=True), patch.object(sys,'argv',['publisher','--apply']), \
                 patch.object(p,'exact_main',return_value='a'*40), \
                 patch.object(p,'payload',return_value={'index.html':b'fixture'}), \
                 patch.object(p,'publication') as publish, contextlib.redirect_stdout(io.StringIO()) as stdout:
                code=p.main()
            receipt=json.loads((Path(d)/'szl-holographic-receipt.json').read_text())
            publish.assert_not_called()
            self.assertEqual(code,1)
            self.assertEqual(receipt['status'],'FAILED')
            self.assertEqual(receipt['error_code'],'PUBLISHER_CREDENTIAL_UNAVAILABLE')
            self.assertEqual(receipt['source_revision'],'a'*40)
            self.assertNotIn('provider_revision',receipt)
            return receipt,stdout.getvalue()

    def test_unavailable_aliases_retain_truthful_failure(self):
        receipt,_=self.missing_run({})
        self.assertFalse(receipt['secret_values_recorded'])
        self.assertEqual(receipt['failed_phase'],'ADMISSION_STARTED')

    def test_github_token_is_not_a_hugging_face_fallback(self):
        receipt,out=self.missing_run({'GITHUB_TOKEN':'synthetic-do-not-transmit'})
        self.assertNotIn('synthetic-do-not-transmit',json.dumps(receipt)+out)


if __name__=='__main__':unittest.main(verbosity=2)
