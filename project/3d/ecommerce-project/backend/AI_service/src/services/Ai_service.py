from groq import Groq
from typing import List, Dict, Any
import re
from ..core.config import settings

class AiService:
    def __init__(self, product_service=None):   # ← recibe el servicio de productos
        api_key = settings.resolved_api_key
        if not api_key:
            raise ValueError("GROQ_API_KEY no encontrada")
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.1-8b-instant"
        self.product_service = product_service   # ← para consultar productos
        self.system_prompt = (
            "Eres un asistente virtual para un e-commerce. "
            "Tienes acceso a la lista de productos reales de la tienda. "
            "Cuando te pregunten por productos, busca en la información que se te provee "
            "y responde con detalles como nombre, precio, disponibilidad y descripción. "
            "Responde en el mismo idioma del usuario, sé breve y amable."
        )

    def _extract_keywords(self, message: str) -> str:
        """Extrae palabras relevantes para buscar productos."""
        # Elimina palabras comunes y deja solo términos significativos
        stopwords = {"hola", "productos", "qué", "cómo", "cuál", "precio", "tienen", "busco", "necesito"}
        words = re.findall(r'\b\w+\b', message.lower())
        keywords = [w for w in words if w not in stopwords and len(w) > 2]
        return " ".join(keywords) if keywords else ""

    def _search_products(self, query: str) -> List[Dict[str, Any]]:
        """Busca productos usando el servicio de productos (si está disponible)."""
        if not self.product_service:
            return []
        # Asumimos que product_service tiene un método search_products(query)
        # Si no, puedes adaptar: por ejemplo, usar el modelo Product para hacer filtros.
        try:
            # Llamada asíncrona - aquí usamos un helper síncrono si es necesario
            # Si tu product_service es asíncrono, necesitarás un evento loop.
            # Por simplicidad, asumimos que product_service tiene un método síncrono o usamos asyncio.run()
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            results = loop.run_until_complete(
                self.product_service.search_products(query, limit=5)
            )
            loop.close()
            return results
        except Exception as e:
            print(f"Error buscando productos: {e}")
            return []

    def get_response(self, user_message: str) -> str:
        """Versión con búsqueda de productos."""
        # 1. Extraer palabras clave
        keywords = self._extract_keywords(user_message)

        # 2. Buscar productos relevantes
        products_info = ""
        if keywords and self.product_service:
            products = self._search_products(keywords)
            if products:
                products_info = "\n\n**Productos disponibles:**\n"
                for p in products[:3]:  # máx 3 productos para no saturar
                    products_info += f"- {p.get('name')}: ${p.get('price')} - {p.get('description', '')[:100]}\n"

        # 3. Construir mensaje enriquecido
        enriched_message = user_message
        if products_info:
            enriched_message = f"{user_message}\n\nInformación de productos:\n{products_info}"

        # 4. Llamar a Groq
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": enriched_message}
                ],
                temperature=0.7,
                max_tokens=500,
                stream=False
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error en Groq: {e}")
            return "Lo siento, no pude procesar tu consulta sobre productos."

    # El método stream_response se puede adaptar igual...