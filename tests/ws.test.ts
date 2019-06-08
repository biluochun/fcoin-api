import { FcoinWebSocket } from '../src/ws';
import { UserConfig } from './config';
const HttpsProxyAgent = require('https-proxy-agent');
import 'mocha';

const agent = UserConfig.AgentConfig ? new HttpsProxyAgent(UserConfig.AgentConfig) : undefined;

describe('ws.ts', function () {
  this.timeout(15000);

  it('OnAllTickers', (done) => {
    const ws = new FcoinWebSocket(agent || undefined, UserConfig.SetFcoinDomain);
    ws.OnAllTickers((data) => {
      ws.Close();
      done();
    });
  });
});
