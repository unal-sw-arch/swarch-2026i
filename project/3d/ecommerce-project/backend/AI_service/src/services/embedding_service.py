"""Local ONNX embedding model (fastembed) wrapped for async use.

fastembed is synchronous and CPU-bound, so every call is dispatched to a
thread via asyncio.to_thread to avoid blocking the event loop.
"""

from __future__ import annotations

import asyncio
import logging
import os
import threading

from ..core.config import settings

logger = logging.getLogger(__name__)

_model = None
_model_lock = threading.Lock()


def _get_model():
    """Lazily instantiate the fastembed model (thread-safe singleton)."""
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                from fastembed import TextEmbedding

                cache_dir = os.environ.get("FASTEMBED_CACHE_PATH")
                logger.info("Loading embedding model %s", settings.ai_embedding_model)
                _model = TextEmbedding(settings.ai_embedding_model, cache_dir=cache_dir)
    return _model


def _embed_sync(texts: list[str]) -> list[list[float]]:
    model = _get_model()
    return [vector.tolist() for vector in model.embed(texts)]


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of documents."""
    if not texts:
        return []
    return await asyncio.to_thread(_embed_sync, texts)


async def embed_query(text: str) -> list[float] | None:
    """Embed a single query string. Returns None for empty input."""
    text = (text or "").strip()
    if not text:
        return None
    vectors = await embed_texts([text])
    return vectors[0] if vectors else None
