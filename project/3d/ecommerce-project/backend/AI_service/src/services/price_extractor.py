"""Hybrid price range extractor: regex first, Groq LLM as fallback."""

from __future__ import annotations

import json
import logging
import re

logger = logging.getLogger(__name__)

# Keywords that signal a product-search intent (to decide whether to use LLM fallback)
_SEARCH_KEYWORDS = re.compile(
    r"\b(recomiend|busco|quiero|necesito|tengo|gift|regalo|producto|comprar|encontrar|"
    r"barato|barat|econ[oó]mic|caro|premium|luj|present|dame|muéstrame|muestrame)\b",
    re.IGNORECASE,
)

# Cheap / economy keywords → cap at max_price
_CHEAP_PATTERN = re.compile(
    r"\b(barato|barat[ao]s?|econ[oó]mic[ao]s?|económic[ao]s?|accesible|low.cost|buen\s+precio|precio\s+bajo)\b",
    re.IGNORECASE,
)
# Premium keywords → start at min_price
_PREMIUM_PATTERN = re.compile(
    r"\b(caro|caros?|premium|lujo|gama\s+alta|high.end|exclusivo|lujoso)\b",
    re.IGNORECASE,
)
# "menos de $X" / "hasta $X" / "máximo $X" / "no más de $X"
_MAX_PRICE_PATTERN = re.compile(
    r"(?:menos\s+de|hasta|m[aá]ximo|no\s+m[aá]s\s+de|menor\s+a|under|less\s+than|below)\s*\$?\s*(\d+(?:[.,]\d+)?)",
    re.IGNORECASE,
)
# "más de $X" / "mínimo $X"
_MIN_PRICE_PATTERN = re.compile(
    r"(?:m[aá]s\s+de|m[ií]nimo|m[ií]nimo\s+de|over|more\s+than|above|desde)\s*\$?\s*(\d+(?:[.,]\d+)?)",
    re.IGNORECASE,
)
# "entre $X y $Y"
_RANGE_PATTERN = re.compile(
    r"entre\s*\$?\s*(\d+(?:[.,]\d+)?)\s*(?:y|a|-|and)\s*\$?\s*(\d+(?:[.,]\d+)?)",
    re.IGNORECASE,
)


def _parse_number(text: str) -> float:
    return float(text.replace(",", "."))


def extract_price_range_regex(text: str) -> dict[str, float | None]:
    """Fast regex-based extraction. Returns {min_price, max_price}, values may be None."""
    min_price: float | None = None
    max_price: float | None = None

    range_match = _RANGE_PATTERN.search(text)
    if range_match:
        a, b = _parse_number(range_match.group(1)), _parse_number(range_match.group(2))
        min_price, max_price = (a, b) if a <= b else (b, a)
        return {"min_price": min_price, "max_price": max_price}

    max_match = _MAX_PRICE_PATTERN.search(text)
    if max_match:
        max_price = _parse_number(max_match.group(1))

    min_match = _MIN_PRICE_PATTERN.search(text)
    if min_match:
        min_price = _parse_number(min_match.group(1))

    if max_price is None and _CHEAP_PATTERN.search(text):
        max_price = 30.0  # default "cheap" ceiling

    if min_price is None and max_price is None and _PREMIUM_PATTERN.search(text):
        min_price = 80.0

    return {"min_price": min_price, "max_price": max_price}


async def extract_price_range(text: str, groq_client=None, model: str = "") -> dict[str, float | None]:
    """
    Hybrid extractor. Tries regex first; if nothing found and the message looks
    like a product query, calls the LLM for structured extraction.
    """
    result = extract_price_range_regex(text)
    if result["min_price"] is not None or result["max_price"] is not None:
        return result

    # Only use LLM fallback for messages that look like product searches
    if groq_client is None or not _SEARCH_KEYWORDS.search(text):
        return result

    try:
        completion = await groq_client.chat.completions.create(
            model=model or "llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract price constraints from the user message. "
                        "Respond ONLY with valid JSON: {\"min_price\": number_or_null, \"max_price\": number_or_null}. "
                        "If no price constraint is mentioned, return {\"min_price\": null, \"max_price\": null}."
                    ),
                },
                {"role": "user", "content": text[:300]},
            ],
            temperature=0,
            max_tokens=60,
        )
        raw = completion.choices[0].message.content.strip()
        parsed = json.loads(raw)
        return {
            "min_price": float(parsed["min_price"]) if parsed.get("min_price") is not None else None,
            "max_price": float(parsed["max_price"]) if parsed.get("max_price") is not None else None,
        }
    except Exception as exc:
        logger.debug("LLM price extraction failed: %s", exc)
        return result
