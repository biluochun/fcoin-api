import { FcoinWebSocket } from '../src/ws';
import { FCoinApi } from '../src/api';
import { SideEnum, DepthLevel } from '../src/types';
import HttpsProxyAgent from 'https-proxy-agent';
import fetch from 'node-fetch';

const agent = new HttpsProxyAgent({
  host: '127.0.0.1',
  port: 50002,
  secureProxy: true,
});
console.log(agent);

fetch('https://www.google.com/', {
  method: 'get',
  agent,
}).then(console.log).catch(console.log);

const ws = new FcoinWebSocket();

ws.Heartbeat();

// setInterval(() => console.log('LastHeartbeat', ws.LastHeartbeat), 3000);

// ws.OnAllTickers((data) => {
//   console.log('OnAllTickers', data);
// });

// ws.OnTicker('ftusdt', (data) => {
//   console.log('OnTicker:ftusdt', data);
// });

const api = new FCoinApi('', '', agent);

// api.OrderCancel('U86EEkrpyaWH32Y9mdf75NP2a5hLp80rOMAAvjN_nY9oof95s-U4YduzFXr_ZorCT-_WhXPWNmqfTuHLgoCVmQ==').then(console.log);

api.FetchBalance().then(console.log);



// api.Ticker('ftusdt').then(console.log);

// api.Depth('ftusdt', DepthLevel.L20).then(console.log);

// api.FetchOrders('ftusdt', 'submitted', '100', {
//   value: Date.now(),
//   type: 'before',
// }).then(console.log);

// api.FetchLeveragedBalances().then(console.log);
// api.FetchLeveragedBalance('eosusdt').then(console.log);