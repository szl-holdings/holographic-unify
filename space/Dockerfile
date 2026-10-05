# SPDX-License-Identifier: Apache-2.0
# Keep the exact generated deployment document in the running image.
#
# Base: python:3.14-slim through mirror.gcr.io, pinned to the multi-arch OCI
# image-index digest that both mirror.gcr.io and registry-1.docker.io returned
# for that tag on 2026-09-29 (3.14.7-slim-trixie; includes linux/amd64).
# Dependabot (docker, /space) refreshes the digest only; a Python minor move
# is a contract change made together with scripts/verify_space.py.
FROM mirror.gcr.io/library/python:3.14-slim@sha256:c3e521df8b2b498a7a682e7e18676771cb80c6b75b8699af886b2d554ce40151
WORKDIR /app
ENV HOST=0.0.0.0 PORT=7860 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
COPY . .
USER 10001:10001
EXPOSE 7860
# Process liveness only: /healthz answers 200 whenever the server runs.
# /readyz stays the source-binding readiness contract checked by the publisher.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["python", "-c", "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/healthz' % os.environ.get('PORT', '7860'), timeout=4)"]
CMD ["python", "-u", "server.py"]
