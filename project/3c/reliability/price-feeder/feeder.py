"""
Deterministic price feeder for the hot-spare demo.

Publishes synthetic game-price events to the SAME fanout exchange the real
scrapper uses (ranking_prices_exchange). This removes the live web-scraping
dependency so the failover demo is fast and reproducible: a steady stream of
priced games flows to BOTH ranking instances in parallel, growing their
(identical) leaderboards while we kill and revive the active node.

Message shape matches scrapper-service / ranking-service GamePriceMessage.
"""
import json
import os
import time

import pika

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
EXCHANGE = os.getenv("RANKING_EXCHANGE", "ranking_prices_exchange")
INTERVAL = float(os.getenv("FEED_INTERVAL_SECONDS", "1.0"))

STORES = ["steam", "epic", "gog"]
TITLES = [
    "Hades", "Hollow Knight", "Celeste", "Stardew Valley", "Hades II",
    "Elden Ring", "Baldur's Gate 3", "Disco Elysium", "Cuphead", "Dead Cells",
    "Terraria", "Outer Wilds", "Slay the Spire", "Vampire Survivors", "Cult of the Lamb",
]


def connect() -> pika.BlockingConnection:
    creds = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    params = pika.ConnectionParameters(
        host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=creds,
        connection_attempts=20, retry_delay=3,
    )
    return pika.BlockingConnection(params)


def main() -> None:
    conn = connect()
    ch = conn.channel()
    ch.exchange_declare(exchange=EXCHANGE, exchange_type="fanout", durable=True)
    print(f"[feeder] publishing to fanout exchange '{EXCHANGE}' every {INTERVAL}s", flush=True)

    i = 0
    while True:
        title = TITLES[i % len(TITLES)]
        store = STORES[i % len(STORES)]
        original = 5000 + (i % 7) * 1000          # original price in cents
        discount_pct = 10 + (i * 7) % 80           # deterministic-but-varied
        price = int(original * (100 - discount_pct) / 100)

        msg = {
            "name": title,
            "store": store,
            "price_cents": price,
            "original_price_cents": original,
            "currency": "USD",
            "url": f"https://example.com/{store}/{title.lower().replace(' ', '-')}",
            "image_url": "",
        }
        ch.basic_publish(
            exchange=EXCHANGE,
            routing_key="",
            body=json.dumps(msg),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        i += 1
        if i % 10 == 0:
            print(f"[feeder] published {i} price events", flush=True)
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
