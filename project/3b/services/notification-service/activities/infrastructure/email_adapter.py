import logging
import json
import urllib.request
from django.core.mail import send_mail
from django.conf import settings
from activities.domain.entities import ActivityEvent

logger = logging.getLogger(__name__)

class EmailNotificationAdapter:
    """
    Adapter Pattern implementation for Interoperability.
    Translates the internal domain ActivityEvent into an external SMTP Email format.
    """
    
    @staticmethod
    def send_order_status_email(event: ActivityEvent):
        """
        Adapts the event and sends it to the configured external email system.
        """
        # We only care about order creation
        if event.event_type.value != "ORDER_CREATED":
            return

        order_id = event.order_id or "Unknown"

        # Tracking link
        tracking_link = f"http://localhost:3001/orders/{order_id}/timeline"
        
        # Mapping domain data to external SMTP format
        subject = f"¡Tu orden DELIUNAL #{order_id} ha sido recibida!"
        message = (
            f"Hola,\n\n"
            f"¡Buenas noticias! Hemos recibido tu orden #{order_id} exitosamente y la cocina pronto comenzará a prepararla.\n\n"
            f"Puedes hacerle seguimiento en tiempo real a tu orden en el siguiente enlace:\n"
            f"{tracking_link}\n\n"
            f"Gracias por preferir DELIUNAL."
        )
        
        # API Composition Pattern: Query auth-service for the real customer email
        recipient_email = "notificacionesdeliunal@gmail.com" # Fallback
        
        customer_id = event.payload.get("customerId")
        if customer_id:
            try:
                auth_url = f"http://auth-service:8000/auth/users/{customer_id}"
                logger.info(f"EmailAdapter: Fetching user email from {auth_url}")
                req = urllib.request.Request(auth_url)
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode())
                        if "email" in data:
                            recipient_email = data["email"]
                            logger.info(f"EmailAdapter: Successfully fetched real email: {recipient_email}")
            except Exception as e:
                logger.error(f"EmailAdapter: Failed to fetch user email, using fallback. Error: {e}")
        
        try:
            logger.info(f"EmailAdapter: Adapting event for Order #{order_id} to SMTP message...")
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            logger.info(f"EmailAdapter: Successfully dispatched email to {recipient_email} via SMTP.")
        except Exception as e:
            logger.error(f"EmailAdapter: Failed to send email for Order #{order_id}. Error: {e}")
