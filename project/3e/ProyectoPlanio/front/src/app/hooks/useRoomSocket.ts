import { useEffect, useRef } from 'react';
import { getIdToken } from '../auth/token';

const WS_URL = (import.meta.env.VITE_API_URL || window.location.origin)
  .replace('https://', 'wss://')

export function useRoomSocket(
  roomId: number,
  userId: number | null,
  onMessage: (msg: any) => void,
) {
  const onMessageRef = useRef(onMessage);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destroyed = useRef(false);

  // actualizar la referencia sin reconectar
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId) return; // esperar hasta tener el db_id real

    destroyed.current = false;

    async function connect() {
      if (destroyed.current) return;

      try {
        const token = await getIdToken();
        if (!token || destroyed.current) return;

        const ws = new WebSocket(
          `${WS_URL}/notifications/ws?roomId=${roomId}&userId=${userId}&token=${token}`
        );
        wsRef.current = ws;

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type !== 'CONNECTED') {
              onMessageRef.current(msg);
            }
          } catch {}
        };

        ws.onclose = () => {
          if (!destroyed.current) {
            reconnectTimer.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => ws.close();

      } catch (err) {
        if (!destroyed.current) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      destroyed.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [roomId, userId]); // solo reconecta si cambia la sala o el usuario
}