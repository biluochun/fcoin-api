import { FcoinWebSocket } from '../src/ws';
import { UserConfig } from './config';
const HttpsProxyAgent = require('https-proxy-agent');
import { expect } from 'chai';
import 'mocha';

const agent = UserConfig.AgentConfig ? new HttpsProxyAgent(UserConfig.AgentConfig) : null;

describe('ws.ts', function () {
  this.timeout(15000);

  it('OnAllTickers', (done) => {
    const ws = agent ? new FcoinWebSocket({ agent }) : new FcoinWebSocket();
    ws.OnAllTickers((data) => {
      ws.Close();
      done();
    });
  });
});
