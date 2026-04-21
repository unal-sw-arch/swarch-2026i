import requests
from .base import BaseScraper
import logging

logger = logging.getLogger(__name__)

class SteamScraper(BaseScraper):
    
    # URLs de imagen con fallback
    STEAM_IMAGE_URLS = [
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg",
        "https://cdn.cloudflare.steamstatic.com/steam/apps/{app_id}/header.jpg",
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/capsule_616x353.jpg",
    ]

    def _get_valid_image_url(self, app_id: int) -> str | None:
        """
        Intenta cada URL de imagen hasta encontrar una válida (status 200).
        Retorna None si ninguna funciona.
        """
        for template in self.STEAM_IMAGE_URLS:
            url = template.format(app_id=app_id)
            try:
                # HEAD request: solo verifica si existe, sin descargar la imagen
                resp = requests.head(url, timeout=5)
                if resp.status_code == 200:
                    logger.debug(f"Imagen válida encontrada para app {app_id}: {url}")
                    return url
            except requests.RequestException:
                continue
        
        logger.warning(f"No se encontró imagen válida para app_id: {app_id}")
        return None

    def scrape(self):
        url = "https://store.steampowered.com/api/featuredcategories?cc=CO"
        logger.info(f"Fetching data from Steam API (CO Region): {url}")
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            games = []
            top_sellers = data.get("top_sellers", {}).get("items", [])

            for item in top_sellers:
                game_id = item.get("id")

                # Primero intenta con la URL de la API, luego valida
                image_from_api = item.get("large_capsule_image") or item.get("small_capsule_image")
                image_url = image_from_api or self._get_valid_image_url(game_id)

                games.append({
                    "store": "Steam",
                    "name": item.get("name"),
                    "price_cents": item.get("final_price"),
                    "original_price_cents": item.get("original_price", item.get("final_price")),
                    "currency": item.get("currency"),
                    "imageUrl": image_url,
                    "url": f"https://store.steampowered.com/app/{game_id}"
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
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            items = data.get("items", [])

            if not items:
                logger.info(f"No se encontraron resultados para '{game_name}' en Steam")
                return None

            # Bug fix: 'best' se define ANTES de usarlo
            best = items[0]
            app_id = best.get("id")

            # Obtener detalles del juego
            detail_url = f"https://store.steampowered.com/api/appdetails?appids={app_id}&cc=CO"
            detail_resp = requests.get(detail_url, timeout=10)
            detail_resp.raise_for_status()
            detail_data = detail_resp.json()

            app_data = detail_data.get(str(app_id), {}).get("data", {})
            price_info = app_data.get("price_overview", {})

            # La API de appdetails ya trae header_image, úsala directamente
            image_url = (
                app_data.get("header_image")          # Fuente más confiable
                or self._get_valid_image_url(app_id)  # Fallback si falla
            )

            return {
                "store": "Steam",
                "name": app_data.get("name", best.get("name")),
                "price_cents": price_info.get("final", 0),
                "original_price_cents": price_info.get("initial", price_info.get("final", 0)),
                "imageUrl": image_url,
                "original_price_cents": price_info.get("initial", price_info.get("final", 0)),
                "currency": price_info.get("currency", "COP"),
                "url": f"https://store.steampowered.com/app/{app_id}"
            }

        except Exception as e:
            logger.error(f"Error searching Steam for '{game_name}': {e}")
            return None
