# Hub hologram — stdlib Python. No npm. GCR pin.
# The publisher uploads space/* to Space root; this file is for whole-repo builds.
#
# Base: python:3.14-slim through mirror.gcr.io, pinned to the multi-arch OCI
# image-index digest that both mirror.gcr.io and registry-1.docker.io returned
# for that tag on 2026-09-29 (3.14.7-slim-trixie; includes linux/amd64).
# Dependabot (docker, /) moves the tag and the digest together.
FROM mirror.gcr.io/library/python:3.14-slim@sha256:c3e521df8b2b498a7a682e7e18676771cb80c6b75b8699af886b2d554ce40151
WORKDIR /app
ENV HOST=0.0.0.0 PORT=7860 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
COPY space/server.py ./server.py
COPY space/index.html ./index.html
EXPOSE 7860
# Process liveness only: /healthz answers 200 whenever the server runs.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["python", "-c", "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/healthz' % os.environ.get('PORT', '7860'), timeout=4)"]
CMD ["python", "-u", "server.py"]
