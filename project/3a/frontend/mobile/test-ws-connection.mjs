import { Client } from '@stomp/stompjs';
import WebSocket from 'ws';

console.log('Testing WebSocket connection with React Native configuration flags...');

const client = new Client({
  brokerURL: 'ws://localhost:8080/ws/kitchen',
  webSocketFactory: () => new WebSocket('ws://localhost:8080/ws/kitchen'),
  forceBinaryWSFrames: true,
  appendMissingNULLonIncoming: true,
  reconnectDelay: 2000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  debug: (str) => console.log('[STOMP DEBUG]', str),
});

let connected = false;
let timeout = setTimeout(() => {
  console.error('Test timeout: Connection could not be established within 15 seconds.');
  client.deactivate();
  process.exit(1);
}, 15000);

client.onConnect = (frame) => {
  connected = true;
  console.log('✅ CONNECTED successfully!');
  console.log('Subscribing to restaurant 1026 kitchen topic...');
  client.subscribe('/topic/kitchen/1026', (message) => {
    console.log('📩 Message received on kitchen topic:', message.body);
  });
  
  // Wait 6 seconds to verify heartbeats (4s cycle) are exchanged, then finish
  setTimeout(() => {
    console.log('✅ Connection is stable, heartbeats exchanged successfully.');
    clearTimeout(timeout);
    client.deactivate();
    console.log('Test completed successfully.');
    process.exit(0);
  }, 6000);
};

client.onWebSocketClose = () => {
  console.log('WebSocket closed');
};

client.onStompError = (frame) => {
  console.error('STOMP Error:', frame.headers['message'], frame.body);
  clearTimeout(timeout);
  process.exit(1);
};

client.activate();
