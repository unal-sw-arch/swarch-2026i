FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

COPY auth_service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY auth_service/src ./auth_service/src

EXPOSE 8001

CMD ["uvicorn", "auth_service.src.main:app", "--host", "0.0.0.0", "--port", "8001"]
