FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY coordinator.py ./

EXPOSE 6001

# Listens on 6001 so it is a drop-in replacement for ranking-service from the
# gateway's point of view (RANKING_SERVICE_URL=http://ranking-coordinator:6001).
CMD ["uvicorn", "coordinator:app", "--host", "0.0.0.0", "--port", "6001"]
