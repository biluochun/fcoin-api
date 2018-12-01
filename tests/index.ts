import { FcoinWebSocket } from '../src/ws';

console.log(1111);
const ws = new FcoinWebSocket();

ws.Heartbeat();

// setInterval(() => console.log(ws.LastHeartbeat), 3000);

ws.OnAllTickers((data) => {
  console.log(data);
});

ws.OnTicker('ftusdt', (data) => {
  // console.log(data);
});
