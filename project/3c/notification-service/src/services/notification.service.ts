import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Subscriber = {
  id: string;
  name: string;
  email: string;
};

type Discount = {
  name: string;
  price_cents: number;
  subscribers: Subscriber[];
};

type NotificationQueueData = {
  count: number;
  discounts: Discount[];
};

export async function processNotificationQueue(data: NotificationQueueData) {
  const { discounts } = data;

  if (!discounts || !Array.isArray(discounts)) {
    console.warn("[notification] Invalid payload, missing discounts:", data);
    return;
  }

  try {
    for (const discount of discounts) {
      const { name: gameName, price_cents, subscribers } = discount;

      if (!subscribers || !Array.isArray(subscribers)) continue;

      const price = (price_cents / 100).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      });

      for (const user of subscribers) {
        const { email, name } = user;

        if (!email) {
          console.warn("[notification] Missing email for subscriber:", user);
          continue;
        }

        const message = `
          🎮 ¡Un juego de tu wishlist está en descuento!
          <br/><br/>
          <strong>${gameName}</strong> ahora cuesta <strong>${price}</strong>.
          <br/><br/>
          ¡Aprovecha antes de que termine la oferta!
        `;

        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: "GameSeeker Notificaciones <onboarding@resend.dev>",
            to: email,
            subject: `¡Descuento en tu wishlist: ${gameName}!`,
            html: `<p>Hola ${name || "jugador"},</p><p>${message}</p>`,
          });
        }

        console.log(
          `[notification] Email sent to ${email} for game ${gameName}`,
        );
      }
    }
  } catch (err) {
    console.error("[notification] Error processing queue:", err);
  }
}
