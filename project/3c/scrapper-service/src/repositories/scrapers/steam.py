import requests
from .base import BaseScraper
import logging

logger = logging.getLogger(__name__)

class SteamScraper(BaseScraper):
    def scrape(self):
        url = "https://store.steampowered.com/api/featuredcategories?cc=CO"
        logger.info(f"Fetching data from Steam API (CO Region): {url}")
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            games = []
            top_sellers = data.get("top_sellers", {}).get("items", [])
            for item in top_sellers:
                games.append({
                    "store": "Steam",
                    "name": item.get("name"),
                    "price_cents": item.get("final_price"),
                    "currency": item.get("currency"),
                    "original_price_cents": item.get("original_price"),
                    "url": f"https://store.steampowered.com/app/{item.get('id')}"
                })
            return games
        except Exception as e:
            logger.error(f"Error scraping Steam: {e}")
            return []

    def search(self, game_name: str):
        """Search for a specific game on Steam by name."""
        url = "https://store.steampowered.com/api/storesearch"
        params = {"term": game_name, "cc": "CO", "l": "english"}
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            items = data.get("items", [])
            if items:
                best = items[0]
                app_id = best.get("id")
                detail_url = f"https://store.steampowered.com/api/appdetails?appids={app_id}&cc=CO"
                detail_resp = requests.get(detail_url)
                detail_data = detail_resp.json()
                app_data = detail_data.get(str(app_id), {}).get("data", {})
                price_info = app_data.get("price_overview", {})
                return {
                    "store": "Steam",
                    "name": app_data.get("name", best.get("name")),
                    "price_cents": price_info.get("final", 0),
                    "currency": price_info.get("currency", "COP"),
                    "original_price_cents": price_info.get("initial", 0),
                    "url": f"https://store.steampowered.com/app/{app_id}"
                }
            return None
        except Exception as e:
            logger.error(f"Error searching Steam for '{game_name}': {e}")
            return None
