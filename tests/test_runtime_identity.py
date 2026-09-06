# SPDX-License-Identifier: Apache-2.0
"""Loopback HTTP qualification of the actual runtime handler; no external calls."""
import importlib.util
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
def load(name, path):
    spec = importlib.util.spec_from_file_location(name,path)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module
p=load('http_test_publisher',ROOT/'scripts/publish_space.py')
s=load('http_test_server',ROOT/'space/server.py')


class RuntimeHttpTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.root=Path(self.tmp.name)
        for name in p.PAYLOAD_FILES: (self.root/name).write_bytes(name.encode())
        with patch.object(p,'SPACE',self.root): self.files=p.payload('a'*40)
        (self.root/'deployment.json').write_bytes(self.files['deployment.json'])
        self.context=patch.object(s,'HERE',self.root); self.context.start()
        self.logs=patch.object(s.Handler,'log_message',lambda *_:None); self.logs.start()
        self.http=ThreadingHTTPServer(('127.0.0.1',0),s.Handler)
        self.thread=threading.Thread(target=self.http.serve_forever,daemon=True); self.thread.start()
        self.origin='http://127.0.0.1:'+str(self.http.server_port)
    def tearDown(self):
        self.http.shutdown();self.http.server_close();self.thread.join(timeout=3)
        self.logs.stop();self.context.stop();self.tmp.cleanup()
    def request(self,path,method='GET'):
        try: response=urllib.request.urlopen(urllib.request.Request(self.origin+path,method=method),timeout=3)
        except urllib.error.HTTPError as e: response=e
        with response: return response.status,response.read(),response.headers
    def test_actual_http_identity_and_manifest_match_generated_bytes(self):
        status,body,_=self.request('/deployment.json')
        self.assertEqual(status,200);self.assertEqual(body,self.files['deployment.json'])
        status,body,_=self.request('/api/build-info')
        self.assertEqual(status,200)
        self.assertEqual(json.loads(body)['source_revision'],'a'*40)
        self.assertEqual(json.loads(body)['source_repository'],p.SOURCE_REPOSITORY)
    def test_missing_and_tampered_identity_return_unavailable_not_html(self):
        (self.root/'index.html').write_text('tampered')
        status,body,_=self.request('/api/build-info')
        self.assertEqual(status,503)
        self.assertEqual(json.loads(body)['state'],'SOURCE_BINDING_UNAVAILABLE')
        (self.root/'deployment.json').unlink()
        self.assertEqual(self.request('/deployment.json')[0],503)
    def test_head_and_unknown_routes_have_truthful_status(self):
        status,body,headers=self.request('/deployment.json','HEAD')
        self.assertEqual(status,200);self.assertEqual(body,b'')
        self.assertEqual(int(headers['Content-Length']),len(self.files['deployment.json']))
        self.assertEqual(self.request('/missing','HEAD')[0],404)
        self.assertEqual(self.request('/healthz')[0],200)


if __name__=='__main__': unittest.main(verbosity=2)
