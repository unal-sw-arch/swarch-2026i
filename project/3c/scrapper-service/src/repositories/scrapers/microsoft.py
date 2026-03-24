import requests
import logging
import difflib
import re
import unicodedata
from .base import BaseScraper

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

CATALOG_BASE = "https://displaycatalog.mp.microsoft.com"
AUTOSUGGEST_URL = f"{CATALOG_BASE}/v7.0/productFamilies/autosuggest"
PRODUCTS_URL = f"{CATALOG_BASE}/v7.0/products"

MARKET = "CO"
LANGUAGE = "es-CO"
CURRENCY = "COP"

class MicrosoftScraper(BaseScraper):

    def __init__(self):
        pass

    def _build_headers(self):
        return {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/114.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json",
            "Accept-Language": LANGUAGE,
        }

    def scrape(self):
        logger.info("MicrosoftScraper scrape() not implemented in bulk.")
        return []

    def _autosuggest(self, game_name: str):
        params = {
            "market": MARKET,
            "languages": LANGUAGE,
            "platformdependencyname": "windows.desktop",
            "productFamilyNames": "Games,Apps",
            "query": game_name,
            "topProducts": 10,
        }
        headers = self._build_headers()
        response = requests.get(
            AUTOSUGGEST_URL, params=params, headers=headers, timeout=15
        )
        response.raise_for_status()
        data = response.json()
        return data.get("Results", [])

    def _get_product_details(self, big_ids: list):
        params = {
            "actionFilter": "Browse",
            "bigIds": ",".join(big_ids),
            "fieldsTemplate": "details",
            "languages": LANGUAGE,
            "market": MARKET,
        }
        headers = self._build_headers()
        response = requests.get(
            PRODUCTS_URL, params=params, headers=headers, timeout=15
        )
        response.raise_for_status()
        data = response.json()
        return data.get("Products", [])
    

    def _is_pc_game(self, product: dict) -> bool:
        properties = product.get("Properties", {})
        
        package_family = properties.get("PackageFamilyName", "")
        if package_family:
            return True

        sku_avails = product.get("DisplaySkuAvailabilities", [])
        for sku in sku_avails:
            sku_props = sku.get("Sku", {}).get("Properties", {})
            packages = sku_props.get("Packages", [])
            for pkg in packages:
                platform_deps = pkg.get("PlatformDependencies", [])
                for dep in platform_deps:
                    platform_name = dep.get("PlatformName", "").lower()
                    if "windows.desktop" in platform_name:
                        return True

        market_props = product.get("MarketProperties", [])
        for mp in market_props:
            search_terms = mp.get("SearchTitles", [])
            if search_terms:
                return True

        return False


    def _extract_price(self, product: dict):
        price_cents = 0
        original_price_cents = 0
        currency = CURRENCY

        sku_avails = product.get("DisplaySkuAvailabilities", [])
        for sku in sku_avails:
            availabilities = sku.get("Availabilities", [])
            for avail in availabilities:
                order_mgmt = avail.get("OrderManagementData", {})
                price_info = order_mgmt.get("Price", {})
                msrp = price_info.get("MSRP", 0)
                list_price = price_info.get("ListPrice", 0)
                curr = price_info.get("CurrencyCode", CURRENCY)

                if msrp > 0 or list_price > 0:
                    original_price_cents = int(float(msrp) * 100) if msrp else 0
                    price_cents = (
                        int(float(list_price) * 100)
                        if list_price
                        else original_price_cents
                    )
                    currency = curr
                    break
            if price_cents > 0:
                break

        return price_cents, original_price_cents, currency

    def search(self, game_name: str):
        try:
            logger.info(f"Searching '{game_name}' on Microsoft Store (CO)...")

            result_sets = self._autosuggest(game_name)

            suggestions = []
            for rs in result_sets:
                for product in rs.get("Products", []):
                    title = product.get("Title", "")
                    big_id = product.get("ProductId", "")
                    if big_id:
                        suggestions.append(
                            {
                                "title": title,
                                "big_id": big_id,
                            }
                        )

            if not suggestions:
                logger.info(
                    f"Microsoft Store search: '{game_name}' not found in autosuggest."
                )
                return None

            cleaned_searched = clean_text(game_name)
            best_suggestion = None
            best_ratio = 0.0

            for s in suggestions:
                cleaned_title = clean_text(s["title"])
                ratio = difflib.SequenceMatcher(
                    None, cleaned_searched, cleaned_title
                ).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_suggestion = s

            if best_ratio < 0.4 or best_suggestion is None:
                logger.info(
                    f"Microsoft Store search: '{game_name}' no close match. "
                    f"Best '{best_suggestion['title'] if best_suggestion else ''}' "
                    f"(ratio {best_ratio:.2f})"
                )
                return None

            products = self._get_product_details([best_suggestion["big_id"]])
            if not products:
                logger.info(
                    f"Microsoft Store: could not get details for "
                    f"'{best_suggestion['title']}'."
                )
                return None

            product = products[0]
            local_props = product.get("LocalizedProperties", [{}])
            title = local_props[0].get(
                "ProductTitle", best_suggestion["title"]
            )
            product_id = product.get("ProductId", best_suggestion["big_id"])

            price_cents, original_price_cents, currency = self._extract_price(
                product
            )

            slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
            url = f"https://www.xbox.com/es-CO/games/store/{slug}/{product_id}"

            return {
                "store": "Microsoft",
                "name": title,
                "price_cents": price_cents,
                "currency": currency,
                "original_price_cents": original_price_cents,
                "url": url,
            }

        except Exception as e:
            logger.error(
                f"Error searching Microsoft Store for '{game_name}': {e}"
            )
            return None
