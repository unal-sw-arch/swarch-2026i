FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

COPY user_service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY user_service/main.py ./user_service/main.py
COPY user_service/src ./user_service/src

EXPOSE 8000

CMD ["uvicorn", "user_service.main:app", "--host", "0.0.0.0", "--port", "8000"]
