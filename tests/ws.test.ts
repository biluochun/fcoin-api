import { FcoinWebSocket } from '../src/ws';
import { UserConfig } from './config';
const HttpsProxyAgent = require('https-proxy-agent');
import { expect } from 'chai';
import 'mocha';

const agent = new HttpsProxyAgent(UserConfig.AgentConfig);

describe('ws.ts', function () {
  this.timeout(15000);

  it('OnAllTickers', (done) => {
    const ws = new FcoinWebSocket({ agent });
    ws.OnAllTickers((data) => {
      ws.Close();
      done();
    });
  });
});
