import { FcoinWebSocket } from '../src/ws';
import { FCoinApi } from '../src/api';
import { SideEnum, DepthLevel } from '../src/types';

const ws = new FcoinWebSocket();

ws.Heartbeat();

// setInterval(() => console.log('LastHeartbeat', ws.LastHeartbeat), 3000);

// ws.OnAllTickers((data) => {
//   console.log('OnAllTickers', data);
// });

// ws.OnTicker('ftusdt', (data) => {
//   console.log('OnTicker:ftusdt', data);
// });

const api = new FCoinApi('', '');

api.OrderCancel('U86EEkrpyaWH32Y9mdf75NP2a5hLp80rOMAAvjN_nY9oof95s-U4YduzFXr_ZorCT-_WhXPWNmqfTuHLgoCVmQ==').then(console.log);

api.FetchBalance().then(console.log);

api.Ticker('ftusdt').then(console.log);

api.Depth('ftusdt', DepthLevel.L20).then(console.log);

api.FetchOrders('ftusdt', 'submitted', '100', {
  value: Date.now(),
  type: 'before',
}).then(console.log);
