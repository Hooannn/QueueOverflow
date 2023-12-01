FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY . .

ENTRYPOINT ["python3"]
CMD ["main.py"]