# Hub hologram — stdlib Python. No npm. GCR pin.
# The publisher uploads space/* to Space root; this file is for whole-repo builds.
#
# Base: python:3.14-slim through mirror.gcr.io, pinned to the multi-arch OCI
# image-index digest that both mirror.gcr.io and registry-1.docker.io returned
# for that tag on 2026-09-29 (3.14.7-slim-trixie; includes linux/amd64).
# Dependabot (docker, /) moves the tag and the digest together.
FROM mirror.gcr.io/library/python:3.15-slim@sha256:f786b2e19cf9bb54e96bfcd4c1b40c4c56336c22e60607ffd4b080ae5b5dee83
WORKDIR /app
ENV HOST=0.0.0.0 PORT=7860 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
# Copy the closed source payload, including every native and retained static asset.
# Raw whole-repo builds have no publication deployment.json, so source identity
# and /readyz remain unavailable until an actual publication document is supplied.
COPY space/Dockerfile space/README.md space/index.html space/server.py \
     space/szl-space-hologram.css space/szl-space-hologram.js \
     space/unify.css space/unify.js space/szl-tokens.css \
     space/szl-icon-32.svg space/favicon.svg space/apple-touch-icon.png \
     space/szl-source.json space/szl-projection.json ./
EXPOSE 7860
# Process liveness only: /healthz answers 200 whenever the server runs.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["python", "-c", "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/healthz' % os.environ.get('PORT', '7860'), timeout=4)"]
CMD ["python", "-u", "server.py"]
