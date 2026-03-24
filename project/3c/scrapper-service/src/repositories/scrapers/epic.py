import logging
from epicstore_api import EpicGamesStoreAPI
from .base import BaseScraper
import difflib
import re
import unicodedata

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

logger = logging.getLogger(__name__)

class EpicScraper(BaseScraper):
    def __init__(self):
        self.api = EpicGamesStoreAPI('en-US', 'CO')
        self.store_url_base = "https://store.epicgames.com/en-US/p/"

    def scrape(self):
        logger.info("EpicScraper scrape() not implemented in bulk.")
        return []

    def _get_slug(self, el):
        slug = el.get('productSlug')
        if not slug:
            offer_mappings = el.get('offerMappings', [])
            if offer_mappings:
                slug = offer_mappings[0].get('pageSlug')
                
        if not slug:
            mappings = el.get('catalogNs', {}).get('mappings', [])
            if mappings:
                slug = mappings[0].get('pageSlug')
                
        if not slug:
            slug = el.get('urlSlug')
        return slug

    def search(self, game_name: str):
        try:
            logger.info(f"Searching '{game_name}' on Epic Games Store via API...")
            games = self.api.fetch_store_games(keywords=game_name, count=10)
            elements = games.get('data', {}).get('Catalog', {}).get('searchStore', {}).get('elements', [])
            
            if not elements:
                logger.info(f"Epic search: '{game_name}' not found.")
                return None

            cleaned_searched = clean_text(game_name)
            best_match = None
            best_ratio = 0.0

            for el in elements:
                title = el.get('title', '')
                cleaned_title = clean_text(title)
                ratio = difflib.SequenceMatcher(None, cleaned_searched, cleaned_title).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match = el

            if best_ratio < 0.4 or best_match is None:
                logger.info(f"Epic search: '{game_name}' no close match found. Best match '{best_match.get('title') if best_match else ''}' (ratio {best_ratio:.2f})")
                return None

            title = best_match.get('title')
            slug = self._get_slug(best_match)
            url = f"{self.store_url_base}{slug}" if slug else "https://store.epicgames.com/"
            
            price_info = best_match.get('price', {}).get('totalPrice', {})
            discount_price = price_info.get('discountPrice', 0)
            original_price = price_info.get('originalPrice', 0)
            currency = price_info.get('currencyCode', 'COP')

            return {
                "store": "Epic",
                "name": title,
                "price_cents": discount_price,
                "currency": currency,
                "original_price_cents": original_price,
                "url": url
            }

        except Exception as e:
            logger.error(f"Error searching Epic via API for '{game_name}': {e}")
            return None
