FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY proxy.py .
COPY start.sh .
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh
EXPOSE 8000
CMD ["/app/start.sh"]

