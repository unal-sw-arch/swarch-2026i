import logging
from repositories.scrapers.steam import SteamScraper
from repositories.scrapers.epic import EpicScraper
from repositories.scrapers.gog import GogScraper
from repositories.scrapers.microsoft import MicrosoftScraper
from .price_comparator import PriceComparator

logger = logging.getLogger(__name__)

class GameService:
    def __init__(self):
        self.steam = SteamScraper()
        self.epic = EpicScraper()
        self.gog = GogScraper()
        self.microsoft = MicrosoftScraper()
        self.comparator = PriceComparator()

    def search_all_stores(self, game_name: str):
        """Search for a game across all configured stores."""
        results = []
        scrapers_list = [
            ("Steam", self.steam),
            ("Epic", self.epic),
            ("GOG", self.gog),
            ("Microsoft", self.microsoft),
        ]

        for store_name, scraper in scrapers_list:
            try:
                result = scraper.search(game_name)
                if result and result.get("price_cents", 0) > 0:
                    results.append(result)
            except Exception as e:
                logger.error(f"Error searching {store_name}: {e}")
        
        return results

    def compare_game_prices(self, game_name: str):
        """Compare prices for a single game across all stores."""
        results = self.comparator.compare([game_name])
        return results[0] if results else None

    def bulk_compare(self, game_names: list):
        """Compare prices for multiple games across all stores."""
        return self.comparator.compare(game_names)

    def search_specific_store(self, store_name: str, game_name: str):
        """Search for a game on a specific store."""
        store_map = {
            "steam": self.steam,
            "epic": self.epic,
            "gog": self.gog,
            "microsoft": self.microsoft,
        }
        
        scraper = store_map.get(store_name.lower())
        if not scraper:
            raise ValueError(f"Unknown store: {store_name}")
            
        return scraper.search(game_name)

    def get_trending_games(self, store_name: str):
        """Get trending/featured games from a specific store."""
        store_map = {
            "steam": self.steam,
            "gog": self.gog,
        }
        
        scraper = store_map.get(store_name.lower())
        if not scraper:
            raise ValueError(f"Trending not available for: {store_name}")
            
        return scraper.scrape()
