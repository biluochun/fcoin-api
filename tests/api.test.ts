import { FCoinApi } from '../src/api';
import { UserConfig } from './config';
const HttpsProxyAgent = require('https-proxy-agent');
import { expect } from 'chai';
import 'mocha';
import { DepthLevel } from '../src/types';

const agent = new HttpsProxyAgent(UserConfig.AgentConfig);
const api = new FCoinApi(UserConfig.ApiSecret, UserConfig.ApiKey, agent);

describe('api.ts', () => {
  it('FetchBalance', async () => {
    const res = await api.FetchBalance();
    expect(res.status).to.equal(0);
  });

  it('Ticker', async () => {
    const res = await api.Ticker(UserConfig.TestSymbol);
    expect(res.status).to.equal(0);
  });

  it('Depth', async () => {
    const res = await api.Depth(UserConfig.TestSymbol, DepthLevel.L20);
    expect(res.status).to.equal(0);
  });

  it('FetchOrders', async () => {
    const res = await api.FetchOrders(UserConfig.TestSymbol, 'submitted', '100', {
      value: Date.now(),
      type: 'before',
    });
    expect(res.status).to.equal(0);
  });

  it('FetchLeveragedBalances', async () => {
    const res = await api.FetchLeveragedBalances();
    expect(res.status).to.equal(0);
  });
});
