import time
import logging
from repositories.scrapers.steam import SteamScraper
from repositories.scrapers.epic import EpicScraper
from repositories.scrapers.gog import GogScraper
from repositories.scrapers.microsoft import MicrosoftScraper

logger = logging.getLogger(__name__)

class PriceComparator:
    def __init__(self):
        self.steam = SteamScraper()
        self.epic = EpicScraper()
        self.gog = GogScraper()
        self.microsoft = MicrosoftScraper()

    def compare(self, game_names: list = None):
        """
        Compare prices for the same games across all stores.
        If no names are provided, use Steam top sellers as a base.
        """
        if not game_names:
            logger.info("No game list provided. Using Steam top sellers as base...")
            steam_games = self.steam.scrape()
            game_names = [g["name"] for g in steam_games]

        results = []
        for name in game_names:
            logger.info(f" Searching '{name}' across all stores...")
            comparison = {"game": name, "prices": []}

            for scraper in [self.steam, self.epic, self.gog, self.microsoft]:
                result = scraper.search(name)
                if result:
                    comparison["prices"].append(result)

            if comparison["prices"]:
                cheapest = min(comparison["prices"], key=lambda x: x["price_cents"])
                comparison["cheapest"] = cheapest

            results.append(comparison)
            time.sleep(0.5)

        return results
    
    def print_comparison(self, results):
        for r in results:
            print(f"\n{'='*60}")
            print(f" {r['game']}")
            print(f"{'='*60}")
            if not r["prices"]:
                print("  Not available on any store")
                continue
            for p in r["prices"]:
                price_cents = p.get('price_cents')
                if price_cents is None or price_cents == 0:
                    print(f"  {p['store']:6s} → Not available on this store")
                    continue

                price = price_cents / 100
                original = p.get('original_price_cents', 0) / 100
                discount = ""
                if original > price and original > 0:
                    pct = round((1 - price / original) * 100)
                    discount = f" (-{pct}%)"
                print(f"  {p['store']:6s} → ${price:>12,.2f} {p['currency']}{discount}")
                print(f"         {p['url']}")

            if "cheapest" in r and r["cheapest"]["price_cents"] and r["cheapest"]["price_cents"] > 0:
                c = r["cheapest"]
                print(f"  Cheapest at: {c['store']} (${c['price_cents']/100:,.2f} {c['currency']})")
            else:
                print("  No valid prices found among stores.")
