FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

COPY AI_service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Bake the ONNX embedding model into the image so startup needs no network.
ENV FASTEMBED_CACHE_PATH=/app/model_cache
RUN python -c "from fastembed import TextEmbedding; TextEmbedding('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', cache_dir='/app/model_cache')"

COPY AI_service ./AI_service

EXPOSE 8005

CMD ["uvicorn", "AI_service.main:app", "--host", "0.0.0.0", "--port", "8005"]