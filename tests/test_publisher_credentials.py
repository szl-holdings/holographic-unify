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
    def test_only_established_aliases_reach_the_publication_step(self):
        workflow=WORKFLOW.read_text()
        before,after=workflow.split('      - name: Publish existing target and verify immutable provider and running bytes\n',1)
        step,remaining=after.split('      - name: Retain explicit pre-publisher failure\n',1)
        self.assertNotIn('secrets.',before)
        self.assertNotIn('secrets.',remaining)
        expression='${{ secrets.HF_ORG_TOKEN || secrets.HF_ORG_TOKEN1 || secrets.HF_TOKEN || secrets.HF_WRITE_TOKEN }}'
        self.assertIn('HF_TOKEN: '+expression,step)
        self.assertEqual(re.findall(r'secrets\.([A-Z_0-9]+)',step),
                         ['HF_ORG_TOKEN','HF_ORG_TOKEN1','HF_TOKEN','HF_WRITE_TOKEN'])
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

    def missing_run(self,extra):
        with tempfile.TemporaryDirectory() as d:
            env={'RUNNER_TEMP':d,**extra}
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
