from __future__ import annotations

import json
import logging
import uuid

from ..core.redis_client import get_redis_client

logger = logging.getLogger(__name__)

_SESSION_TTL = 3600  # 1 hour sliding
_MAX_TURNS = 10      # store up to 10 turns (20 messages)


def _key(user_id: uuid.UUID) -> str:
    return f"ai:session:{user_id}"


async def get_history(user_id: uuid.UUID, limit: int = 8) -> list[dict]:
    """Return the last `limit` messages as [{role, content}, ...]."""
    try:
        r = get_redis_client()
        raw = await r.get(_key(user_id))
        if not raw:
            return []
        turns: list[dict] = json.loads(raw)
        # turns is a flat list of {role, content} messages; return the last limit items
        return turns[-limit:]
    except Exception as exc:
        logger.warning("conversation_memory.get_history failed: %s", exc)
        return []


async def append_turn(user_id: uuid.UUID, user_msg: str, ai_msg: str) -> None:
    """Append a user+assistant turn to the session and refresh TTL."""
    try:
        r = get_redis_client()
        key = _key(user_id)
        raw = await r.get(key)
        turns: list[dict] = json.loads(raw) if raw else []
        turns.append({"role": "user", "content": user_msg})
        turns.append({"role": "assistant", "content": ai_msg})
        # Trim to max turns (pairs of 2 messages)
        max_messages = _MAX_TURNS * 2
        if len(turns) > max_messages:
            turns = turns[-max_messages:]
        await r.set(key, json.dumps(turns, ensure_ascii=False), ex=_SESSION_TTL)
    except Exception as exc:
        logger.warning("conversation_memory.append_turn failed: %s", exc)


async def clear(user_id: uuid.UUID) -> None:
    """Delete the session history for a user."""
    try:
        r = get_redis_client()
        await r.delete(_key(user_id))
    except Exception as exc:
        logger.warning("conversation_memory.clear failed: %s", exc)
