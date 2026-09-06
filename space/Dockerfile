# SPDX-License-Identifier: Apache-2.0
# Keep the exact generated deployment document in the running image.
FROM mirror.gcr.io/library/python:3.12-slim
WORKDIR /app
ENV HOST=0.0.0.0 PORT=7860 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
COPY . .
USER 10001:10001
EXPOSE 7860
CMD ["python", "-u", "server.py"]
