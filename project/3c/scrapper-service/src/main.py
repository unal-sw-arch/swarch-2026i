import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

game_service = GameService()

test_games = [
    "The Witcher 3 Wild Hunt",
    "Cyberpunk 2077",
    "Hollow Knight",
    "Baldurs Gate 3",
    "Stardew Valley",
]

def test_search_methods():
    """Test the search method via GameService with known games."""
    logger.info("=== Testing Search Methods via GameService ===")

    for game in test_games:
        logger.info(f"\n--- Searching for '{game}' across all stores ---")
        results = game_service.search_all_stores(game)
        if results:
            for result in results:
                price = result["price_cents"] / 100
                logger.info(
                    f"Found on {result['store']}: {result['name']} "
                    f"-> ${price:,.2f} {result['currency']}"
                )
                logger.info(f"  URL: {result['url']}")
        else:
            logger.info(f"Not found on any store")

def test_comparator():
    """Test the price comparison via GameService."""
    logger.info("=== Testing Price Comparator via GameService ===")
    results = game_service.bulk_compare(test_games)
    game_service.comparator.print_comparison(results)

def run_full_pipeline():
    """Run the scraping pipeline for trending games."""
    logger.info("=== Running Trending Games Pipeline ===")
    producer = PrintBroker()

    try:
        producer.connect()
        all_games = []
        for store in ["steam", "gog"]:
            logger.info(f"Scraping trending games from {store}...")
            games = game_service.get_trending_games(store)
            all_games.extend(games)

        logger.info(f"Total games scraped: {len(all_games)}")
        producer.publish(all_games)
        logger.info("Successfully published all games to the message broker.")

    except Exception as e:
        logger.error(f"An error occurred during execution: {e}")
    finally:
        producer.close()
        logger.info("Scraper finished.")

def main():
    logger.info("Starting Game Price Scraper (Layered Architecture)...")
    

    test_search_methods()


    test_comparator()

if __name__ == "__main__":
    main()
