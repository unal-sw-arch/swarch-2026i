# Game Price Scraper

A Python-based microservice that scrapes and compares video game prices across multiple digital stores: **Steam**, **Epic Games**, **GOG**, and **Microsoft Store**. It exposes a REST API for searching and comparing game prices in Colombian Pesos (COP).

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Running with Docker (Recommended)](#running-with-docker)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [API Usage Examples](#usage-examples)
- [Running with swagger](#Run-with-swagger)
- [Supported Stores](#supported-stores)
- [How It Works](#how-it-works)

---

## Features

- **Multi-store price comparison**: Search and compare game prices across Steam, Epic Games, GOG, and Microsoft Store.
- **Regional pricing**: Fetches prices in Colombian Pesos (COP) where available. Falls back to USD-to-COP conversion using live exchange rates.
- **Fuzzy matching**: Uses text similarity algorithms to match game titles across different stores, even when names differ slightly.
- **REST API**: Exposes HTTP endpoints for easy integration with an API Gateway or frontend.
- **Dockerized**: Runs as a containerized microservice with Docker and Docker Compose.
- **RabbitMQ integration**: Prepared for message queue publishing via RabbitMQ.

---

## Architecture



---

## Project Structure

    scrapper-service/
    └── src/
        ├── controllers/
        │   ├── __init__.py
        │   └── game_controller.py
        ├── repositories/
        │   ├── brokers/
        │   │   ├── __init__.py
        │   │   ├── base.py
        │   │   ├── print.py
        │   │   └── rabbitmq.py
        ├── scrapers/
        │   ├── __init__.py
        │   ├── base.py
        │   ├── currencyExchange.py
        │   ├── epic.py
        │   ├── gog.py
        │   ├── microsoft.py
        │   ├── steam.py
        ├── services/
        │   ├── __init__.py
        │   ├── game_service.py
        │   └── price_comparator.py
        ├── app.py
        ├── config.py
        ├── swagger.yaml
        └── main.py
        

└── python/
└── swagger.yaml



## Prerequisites

- Docker and Docker Compose installed (https://www.docker.com/products/docker-desktop/)
- Python 3.8+ (only if running locally)

## Running with Docker

1. Make sure Docker Desktop is running.
2. Build and start: `docker-compose up --build`
3. Verify: `docker ps`
4. Test: `curl http://localhost:5000/health`
5. Stop: `docker-compose down`

## Running Locally

1. Create venv: `python -m venv venv`
2. Activate: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
3. Install: `pip install -r requirements.txt`
4. Run: `cd src && python app.py`

## API Endpoints

Base URL: http://localhost:5000 (external) or http://game-scraper:5000 (inside Docker)
GET /api/v1/games/ - Welcome or index endpoint GET /api/v1/games/health - Health check of the service

GET /api/v1/games/search?name=<game_name> Search for a game in all supported stores.

GET /api/v1/games/compare?name=<game_name> Compare prices for a single game across all stores.

POST /api/v1/games/compare/bulk Compare prices for multiple games simultaneously. Request Body JSON example: { "games": ["Game1", "Game2", "Game3"] }

GET /api/v1/games/search/<store>?name=<game_name> Search for a game on a specific store. Valid stores: steam, epic, gog, microsoft

GET /api/v1/games/trending/<store> Get trending games from a store. Supported stores: steam, gog

## Usage Examples

curl http://localhost:5000/health
curl "http://localhost:5000/api/v1/games/search?name=Cyberpunk%202077"
curl "http://localhost:5000/api/v1/games/compare?name=The%20Witcher%203"
curl "http://localhost:5000/api/v1/games/search/steam?name=Elden%20Ring" 
curl http://localhost:5000/api/v1/games/trending/steam
curl -X POST -H "Content-Type: application/json" -d '{"games":["Cyberpunk 2077","Stardew Valley"]}' http://localhost:5000/api/v1/games/compare/bulk 
To use bulk you need a POST request 

## Run with swagger
First run docker run -p 80:8080 -e SWAGGER_JSON=/swagger.yaml -v "C:..\scrapper-service\src\swagger.yaml:/swagger.yaml" swaggerapi/swagger-ui
Make sure to update the file path first!
Afterwards you can go to http://localhost/ to test the endpoints
You will have an interactive Swagger UI to explore and test all the API endpoints.

## Supported Stores

- Steam Colombia  (native)
- Microsoft store Colombia (native, PC only)
- GOG USD to COP
- Epic Games Colombia (via API)

## How it works

-Each store has a scraper that searches games and retrieves prices.
-Steam and Microsoft return native COP prices for Colombia.
-GOG prices are in USD and converted using a live exchange rate from exchangerate-api.com (fallback: 4000 COP/USD).
-Fuzzy matching (difflib.SequenceMatcher) handles title differences across stores.
-The PriceComparator searches all stores and determines the cheapest option.
