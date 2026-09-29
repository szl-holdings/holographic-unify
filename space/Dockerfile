# SPDX-License-Identifier: Apache-2.0
# Keep the exact generated deployment document in the running image.
#
# Base: python:3.12-slim through mirror.gcr.io, pinned to the multi-arch OCI
# image-index digest that both mirror.gcr.io and registry-1.docker.io returned
# for that tag on 2026-09-29 (3.12.14-slim-trixie; includes linux/amd64).
# Dependabot (docker, /space) moves the tag and the digest together.
FROM mirror.gcr.io/library/python:3.12-slim@sha256:f77ac9e44ae96ef2c90b8053ea08c31f8be030f824196b0ae4db6d462c84e51f
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
