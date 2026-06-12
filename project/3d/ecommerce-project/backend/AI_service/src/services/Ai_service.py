"""AI service: grounds the LLM response on real product-service data with memory and user context."""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

from groq import AsyncGroq

from ..core.config import settings
from . import conversation_memory, price_extractor, product_client, user_context

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = (
    "Eres un asistente virtual personalizado para un e-commerce. "
    "Tus reglas son:\n"
    "1. SOLO recomiendas productos que aparezcan en el bloque 'Productos disponibles'.\n"
    "2. SIEMPRE respetas el presupuesto del usuario. Si menciona 'barato', 'económico' o un precio máximo, "
    "NUNCA recomiendes productos que superen ese precio. "
    "Si no hay productos en ese rango, dilo claramente y sugiere ampliar el presupuesto.\n"
    "3. Usa el historial de conversación para entender el contexto (colores, categorías, usos mencionados antes).\n"
    "4. Si conoces el nombre del usuario, úsalo. Si conoces sus compras previas, tenlas en cuenta.\n"
    "5. Sé breve y amable. Recomienda máximo 3 productos por respuesta.\n"
    "6. NUNCA inventes nombres, precios, descripciones ni stock."
)


class AiService:
    def __init__(self) -> None:
        api_key = settings.resolved_api_key
        if not api_key:
            raise ValueError("AI_API_KEY / GROQ_API_KEY no encontrada")
        self.client = AsyncGroq(api_key=api_key)
        self.model = settings.ai_model

    @staticmethod
    def _build_search_query(user_message: str) -> str:
        return (user_message or "").strip()[:100]

    @staticmethod
    def _format_products(products: list[dict[str, Any]]) -> str:
        if not products:
            return ""
        lines: list[str] = []
        for product in products:
            name = product.get("name") or "(sin nombre)"
            price = product.get("price")
            stock = product.get("stock")
            description = (product.get("description") or "").strip()
            if len(description) > 140:
                description = description[:137] + "..."
            details = [f"- {name}"]
            if price is not None:
                details.append(f"precio: ${price}")
            if stock is not None:
                details.append(f"stock: {stock}")
            if description:
                details.append(description)
            lines.append(" | ".join(details))
        return "\n".join(lines)

    @staticmethod
    def _build_user_block(ctx: dict[str, Any]) -> str:
        if not ctx:
            return ""
        parts: list[str] = []
        if ctx.get("name"):
            parts.append(f"Nombre: {ctx['name']}")
        if ctx.get("order_count"):
            parts.append(f"Pedidos realizados: {ctx['order_count']}")
        if ctx.get("top_products"):
            products_str = ", ".join(ctx["top_products"])
            parts.append(f"Productos que más ha comprado: {products_str}")
        return "\n".join(parts)

    async def get_response(
        self,
        user_message: str,
        auth_token: str | None,
        user_id: uuid.UUID | None = None,
        clear_history: bool = False,
    ) -> str:
        # Clear session if requested
        if clear_history and user_id:
            await conversation_memory.clear(user_id)
            return "Conversación reiniciada. ¿En qué puedo ayudarte?"

        query = self._build_search_query(user_message)

        # Parallel: history, user profile, price extraction
        async def _empty_list() -> list:
            return []

        async def _empty_dict() -> dict:
            return {}

        history_coro = (
            conversation_memory.get_history(user_id) if user_id else _empty_list()
        )
        context_coro = (
            user_context.get_user_context(user_id, auth_token) if user_id else _empty_dict()
        )
        price_coro = price_extractor.extract_price_range(
            user_message, groq_client=self.client, model=self.model
        )

        history, ctx, price_range = await asyncio.gather(
            history_coro, context_coro, price_coro
        )

        min_price = price_range.get("min_price")
        max_price = price_range.get("max_price")

        # Product search with price filters
        products: list[dict[str, Any]] = []
        if query:
            products = await product_client.search_products(
                query, auth_token, limit=8, min_price=min_price, max_price=max_price
            )
        if not products:
            products = await product_client.list_products(
                auth_token, limit=8, max_price=max_price
            )

        # Build context blocks
        products_block = self._format_products(products)
        products_section = (
            f"Productos disponibles:\n{products_block}"
            if products_block
            else "Productos disponibles: (ninguno coincide con los criterios indicados)"
        )

        user_block = self._build_user_block(ctx)

        # Build the messages list for Groq
        messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Inject user context as a system note
        if user_block:
            messages.append({
                "role": "system",
                "content": f"Información del usuario:\n{user_block}",
            })

        # Add conversation history
        messages.extend(history)

        # Final user message with product context
        enriched = (
            f"Pregunta del usuario:\n{user_message}\n\n"
            f"Contexto autoritativo (única fuente de verdad):\n{products_section}"
        )
        if min_price is not None or max_price is not None:
            price_note = []
            if min_price is not None:
                price_note.append(f"precio mínimo ${min_price}")
            if max_price is not None:
                price_note.append(f"precio máximo ${max_price}")
            enriched += f"\n\nRESTRICCIÓN DE PRECIO DETECTADA: {', '.join(price_note)}. " \
                        "No recomiendes nada fuera de este rango."
        messages.append({"role": "user", "content": enriched})

        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3,
                max_tokens=600,
                stream=False,
            )
            response_text = completion.choices[0].message.content
        except Exception as exc:
            logger.exception("Groq completion failed: %s", exc)
            return "Lo siento, no pude procesar tu consulta en este momento."

        # Persist turn to session memory
        if user_id:
            await conversation_memory.append_turn(user_id, user_message, response_text)

        return response_text
