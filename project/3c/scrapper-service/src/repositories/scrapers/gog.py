import requests
import logging
import difflib
import re
import unicodedata
from .base import BaseScraper
from .currencyExchange import get_usd_to_cop_rate

logger = logging.getLogger(__name__)


def clean_text(text: str) -> str:
    """Normalize and clean text for fuzzy comparison."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class GogScraper(BaseScraper):

    CATALOG_URL = "https://catalog.gog.com/v1/catalog"

    def __init__(self):
        self.usd_to_cop = get_usd_to_cop_rate()

    def _build_headers(self):
        return {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/114.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json",
            "Referer": "https://www.gog.com/",
            "Origin": "https://www.gog.com",
        }

    def _convert_to_cop_cents(self, amount_str):
       
        try:
            usd_amount = float(amount_str)
            cop_amount = usd_amount * self.usd_to_cop
            cop_cents = int(cop_amount * 100)
            return cop_cents
        except (ValueError, TypeError):
            return 0

    def scrape(self):
        """Fetch trending games from GOG catalog."""
        url = f"{self.CATALOG_URL}?limit=50&order=trending"
        logger.info(f"Fetching data from GOG API: {url}")
        try:
            headers = self._build_headers()
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            games = []
            for product in data.get("products", []):
                price_info = product.get("price", {})
                if not price_info:
                    continue

                games.append({
                    "store": "GOG",
                    "name": product.get("title"),
                    "price_cents": self._convert_to_cop_cents(
                        price_info.get("finalAmount", "0")
                    ),
                    "currency": "COP",
                    "original_price_cents": self._convert_to_cop_cents(
                        price_info.get("baseAmount", "0")
                    ),
                    "url": product.get("storeLink"),
                })
            return games
        except Exception as e:
            logger.error(f"Error scraping GOG: {e}")
            return []

    def _search_via_catalog(self, game_name: str):
       
        headers = self._build_headers()
        params = {
            "limit": 20,
            "order": "desc:score",
            "productType": "in:game,pack",
            "query": f"like:{game_name}",
            "countryCode": "CO",
            "locale": "en-US",
            "currencyCode": "USD",
        }
        try:
            response = requests.get(
                self.CATALOG_URL,
                params=params,
                headers=headers,
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            products = data.get("products", [])
            if products:
                logger.info(
                    f"GOG catalog search returned {len(products)} results "
                    f"for '{game_name}'"
                )
                titles = [p.get("title", "?") for p in products]
                logger.info(f"GOG catalog titles: {titles}")
            return products
        except Exception as e:
            logger.warning(
                f"GOG catalog search failed for '{game_name}': {e}"
            )
            return []

    def _search_via_website(self, game_name: str):
        
        headers = self._build_headers()
        search_url = "https://www.gog.com/games/ajax/filtered"
        params = {
            "mediaType": "game",
            "search": game_name,
        }
        try:
            response = requests.get(
                search_url,
                params=params,
                headers=headers,
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            products = data.get("products", [])
            if products:
                logger.info(
                    f"GOG website search returned {len(products)} results "
                    f"for '{game_name}'"
                )
                titles = [p.get("title", "?") for p in products]
                logger.info(f"GOG website titles: {titles}")
            return products
        except Exception as e:
            logger.warning(
                f"GOG website search failed for '{game_name}': {e}"
            )
            return []

    def _search_via_embed(self, game_name: str):
        """
        Fallback: Search using embed.gog.com endpoint.
        Returns list of products or empty list.
        """
        headers = self._build_headers()
        search_url = "https://embed.gog.com/games/ajax/filtered"
        params = {
            "mediaType": "game",
            "search": game_name,
        }
        try:
            response = requests.get(
                search_url,
                params=params,
                headers=headers,
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            products = data.get("products", [])
            if products:
                logger.info(
                    f"GOG embed search returned {len(products)} results "
                    f"for '{game_name}'"
                )
                titles = [p.get("title", "?") for p in products]
                logger.info(f"GOG embed titles: {titles}")
            return products
        except Exception as e:
            logger.warning(
                f"GOG embed search failed for '{game_name}': {e}"
            )
            return []

    def _find_best_match(self, game_name: str, products: list):
        """
        Find the best fuzzy match from a list of products.
        Returns (ratio, product) or (0, None) if no match found.
        """
        cleaned_searched = clean_text(game_name)
        best_match = None
        best_ratio = 0.0

        for product in products:
            title = product.get("title", "")
            cleaned_title = clean_text(title)

            ratio = difflib.SequenceMatcher(
                None, cleaned_searched, cleaned_title
            ).ratio()

            if cleaned_searched in cleaned_title:
                ratio = max(ratio, 0.8)

            if ratio > best_ratio:
                best_ratio = ratio
                best_match = product

        return best_ratio, best_match

    def _extract_price_from_catalog(self, product: dict):
        """Extract price from catalog API product format."""
        price_info = product.get("price", {})

        logger.info(f"GOG catalog raw price data: {price_info}")

        if not price_info:
            return 0, 0

        final_money = price_info.get("finalMoney", {})
        base_money = price_info.get("baseMoney", {})

        if final_money and final_money.get("amount"):
            final = self._convert_to_cop_cents(final_money["amount"])
            base = self._convert_to_cop_cents(
                base_money.get("amount", final_money["amount"])
            )
            if final > 0:
                return final, base

        final_str = price_info.get("final", "0")
        base_str = price_info.get("base", final_str)

        final_str = str(final_str).replace("$", "").strip()
        base_str = str(base_str).replace("$", "").strip()

        final = self._convert_to_cop_cents(final_str)
        base = self._convert_to_cop_cents(base_str)

        if final > 0:
            return final, base

        logger.info(
            f"GOG catalog: could not extract price from: {price_info}"
        )
        return 0, 0

    def _extract_price_from_website(self, product: dict):
        """Extract price from website/embed API product format."""
        price = product.get("price", {})
        if not price:
            return 0, 0

        final_amount = price.get("finalAmount") or price.get("amount", "0")
        base_amount = price.get("baseAmount", final_amount)

        if isinstance(final_amount, str):
            final = self._convert_to_cop_cents(final_amount)
            base = self._convert_to_cop_cents(base_amount)
        else:
            final = int(float(final_amount) * self.usd_to_cop / 100)
            base = int(float(base_amount) * self.usd_to_cop / 100)

        return final, base

    def _build_url(self, product: dict):
        """Build a proper GOG store URL from product data."""
        slug = product.get("slug", "")
        if slug:
            return f"https://www.gog.com/en/game/{slug}"

        store_link = product.get("storeLink", "")
        if store_link:
            if store_link.startswith("http"):
                return store_link
            return f"https://www.gog.com{store_link}"

        url = product.get("url", "")
        if url:
            if url.startswith("http"):
                return url
            return f"https://www.gog.com{url}"

        return ""

    def search(self, game_name: str):
    
        logger.info(f"GOG search: querying for '{game_name}'...")

        search_methods = [
            ("catalog", self._search_via_catalog, self._extract_price_from_catalog),
            ("website", self._search_via_website, self._extract_price_from_website),
            ("embed", self._search_via_embed, self._extract_price_from_website),
        ]

        for method_name, search_fn, price_fn in search_methods:
            products = search_fn(game_name)

            if not products:
                logger.info(
                    f"GOG {method_name} search: no results for '{game_name}'"
                )
                continue

            best_ratio, best_match = self._find_best_match(
                game_name, products
            )

            if best_ratio < 0.4 or best_match is None:
                logger.info(
                    f"GOG {method_name} search: no close match for "
                    f"'{game_name}'. Best: "
                    f"'{best_match.get('title', '') if best_match else ''}' "
                    f"(ratio {best_ratio:.2f})"
                )
                continue

            title = best_match.get("title", "")
            logger.info(
                f"GOG {method_name} search: matched '{title}' "
                f"(ratio {best_ratio:.2f})"
            )

            price_cents, original_cents = price_fn(best_match)

            if price_cents <= 0:
                logger.info(
                    f"GOG search: '{title}' matched but no valid price. "
                    f"Trying next method..."
                )
                continue

            url = self._build_url(best_match)

            return {
                "store": "GOG",
                "name": title,
                "price_cents": price_cents,
                "currency": "COP",
                "original_price_cents": original_cents,
                "url": url,
            }

        logger.info(
            f"GOG search: '{game_name}' not found across all search methods."
        )
        return None
