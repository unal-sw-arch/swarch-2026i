FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

COPY AI_service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY AI_service ./AI_service

EXPOSE 8005

CMD ["uvicorn", "AI_service.main:app", "--host", "0.0.0.0", "--port", "8005"]