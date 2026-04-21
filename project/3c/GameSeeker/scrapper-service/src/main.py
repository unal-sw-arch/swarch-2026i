import logging
from services.game_service import GameService
from services.discount_service import DiscountService
from repositories.brokers.rabbitmq import RabbitMQProducer
from repositories.brokers.print import PrintBroker
from services.user_service_client import UserServiceClient
import time
from config import Config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

game_service = GameService()
discount_service = DiscountService()
user_client = UserServiceClient()

def run_wishlist_pipeline(producer):
    logger.info("=== Running Wishlist Pricing Pipeline ===")
    
    wishlist_games = user_client.get_wishlist_games()
    if not wishlist_games:
        logger.info("No wishlist games found. Skipping this cycle.")
        return
        
    logger.info(f"Retrieved {len(wishlist_games)} distinct games to scrape.")
    all_games = []
    
    for game_name in wishlist_games:
        logger.info(f"Scraping prices for: {game_name}")
        results = game_service.search_all_stores(game_name)
        if results:
            valid_results = [r for r in results if r and "price_cents" in r]
            if valid_results:
                best = min(valid_results, key=lambda x: x["price_cents"])
                best["name"] = game_name 
                all_games.append(best)
    
    logger.info(f"Successfully scraped prices for {len(all_games)} games.")
    if not all_games:
        return
        
    discounted_games = discount_service.process_discounts(all_games)
    if discounted_games:
        game_names = [g["name"] for g in discounted_games]
        subscribers = user_client.get_subscribers_for_games(game_names)
        
        for g in discounted_games:
            g["subscribers"] = subscribers.get(g["name"], [])
            
        logger.info(f"Found {len(discounted_games)} new discounts! Publishing to notification queue...")
        producer.publish_notification(discounted_games)
        
    price_updates = []
    for g in all_games:
        price_updates.append({
            "gameName": g["name"],
            "priceCents": g.get("price_cents"),
            "originalPriceCents": g.get("original_price_cents"),
            "currency": g.get("currency"),
            "store": g.get("store")
        })
    user_client.update_game_prices(price_updates)

    producer.publish(all_games)
    logger.info("Wishlist Cycle finished.")

def run_trending_pipeline(producer):
    logger.info("=== Running Trending Games Pipeline ===")
    
    all_trending = []
    
    try:
        steam_trending = game_service.get_trending_games("steam")
        if steam_trending:
            all_trending.extend(steam_trending)
            logger.info(f"Got {len(steam_trending)} trending games from Steam")
    except Exception as e:
        logger.error(f"Error getting Steam trending: {e}")
        
    try:
        gog_trending = game_service.get_trending_games("gog")
        if gog_trending:
            all_trending.extend(gog_trending)
            logger.info(f"Got {len(gog_trending)} trending games from GOG")
    except Exception as e:
        logger.error(f"Error getting GOG trending: {e}")
        
    if all_trending:
        logger.info(f"Publishing {len(all_trending)} trending games to RabbitMQ")
        producer.publish(all_trending)
    else:
        logger.info("No trending games found.")
        
    logger.info("Trending Cycle finished.")

def main():
    logger.info("Starting Game Price Scraper (Wishlist Loop Mode)...")
    sleep_seconds = Config.LOOP_INTERVAL_MINUTES * 60
    logger.info(f"Loop interval configured to {Config.LOOP_INTERVAL_MINUTES} minutes.")
    
    producer = RabbitMQProducer()
    
    connected = False
    while not connected:
        try:
            producer.connect()
            connected = True
            logger.info("Successfully connected to RabbitMQ.")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ, retrying in 5 seconds...: {e}")
            time.sleep(5)
            
    try:
        while True:
            try:
                run_wishlist_pipeline(producer)
            except Exception as e:
                logger.error(f"Error running wishlist pipeline: {e}")
                
            try:
                run_trending_pipeline(producer)
            except Exception as e:
                logger.error(f"Error running trending pipeline: {e}")
                
            logger.info(f"Sleeping for {sleep_seconds} seconds before next cycle...")
            time.sleep(sleep_seconds)
    except KeyboardInterrupt:
        logger.info("Interrupted. Shutting down...")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    finally:
        producer.close()

if __name__ == "__main__":
    main()
