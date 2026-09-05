# Hub hologram — stdlib Python. No npm. GCR pin.
# The publisher uploads space/* to Space root; this file is for whole-repo builds.
FROM mirror.gcr.io/library/python:3.12-slim
WORKDIR /app
ENV HOST=0.0.0.0 PORT=7860 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
COPY space/server.py ./server.py
COPY space/index.html ./index.html
EXPOSE 7860
CMD ["python", "-u", "server.py"]
