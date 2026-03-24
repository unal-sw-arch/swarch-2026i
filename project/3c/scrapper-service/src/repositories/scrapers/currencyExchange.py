import requests
import logging

logger = logging.getLogger(__name__)


def get_usd_to_cop_rate():

    fallback_rate = 4000
    try:
        url = "https://api.exchangerate-api.com/v4/latest/USD"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        rate = data.get("rates", {}).get("COP")
        if rate:
            logger.info(f"Fetched USD to COP exchange rate: {rate}")
            return rate
        logger.warning(
            "COP rate not found in API response. Using fallback rate."
        )
        return fallback_rate
    except Exception as e:
        logger.warning(
            f"Failed to fetch exchange rate: {e}. "
            f"Using fallback rate: {fallback_rate}"
        )
        return fallback_rate
