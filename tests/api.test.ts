import { FCoinApi } from '../src/api';
import { UserConfig } from './config';
const HttpsProxyAgent = require('https-proxy-agent');
import { expect } from 'chai';
import 'mocha';
import { DepthLevel } from '../src/types';

const agent = UserConfig.AgentConfig ? new HttpsProxyAgent(UserConfig.AgentConfig) : undefined;
const api = new FCoinApi(UserConfig.ApiSecret, UserConfig.ApiKey, agent, UserConfig.SetFcoinDomain);

describe('api.ts', () => {
  it('FetchBalance', async function () {
    const res = await api.FetchBalance();
    expect(res.status).to.equal(0);
  });

  it('Ticker', async function () {
    const res = await api.Ticker(UserConfig.TestSymbol);
    expect(res.status).to.equal(0);
  });

  it('Depth', async function () {
    const res = await api.Depth(UserConfig.TestSymbol, DepthLevel.L20);
    expect(res.status).to.equal(0);
  });

  it('FetchOrders', async function () {
    const res = await api.FetchOrders(UserConfig.TestSymbol, 'submitted', '100', {
      value: Date.now(),
      type: 'before',
    });
    console.log(res);
    expect(res.status).to.equal(0);
  });

  it('FetchLeveragedBalances', async function () {
    const res = await api.FetchLeveragedBalances();
    expect(res.status).to.equal(0);
  });
});
