import crypto from 'crypto';
import fetch from 'node-fetch';
import { SymbolEnum, SideEnum, DepthLevel, DepthUnit, FcoinApiRes, CoinHas, OrderResult, TickerData, DepthData, LeveragedBalance, CandleResolution } from './types';
import { FCoinUrl } from '.';
import { URL } from 'url';

export class FCoinApi {
  private UserConfig = {
    Key: '',
    Secret: '',
  };
  private Agent = undefined;

  constructor (key: string, secret: string, agent?: any) {
    this.UserConfig.Key = key;
    this.UserConfig.Secret = secret;
    this.Agent = agent;
    // this.axios = Axios.create({
    //   baseURL: FCoinUrl.ApiV2,
    //   timeout: 10000,
    // });
    // this.axios.interceptors.request.use((request) => this.transformRequest(request), (err) => this.onRejected(err));
    // this.axios.interceptors.response.use((response) => this.transformResponse(response), (err) => this.onRejected(err));
  }

  private async fetch (method: 'POST' | 'GET' | 'DELETE', urlTo: string, body?: any, args?: any): Promise<FcoinApiRes<any>> {
    const time = Date.now().toString();
    const data = [] as string[];
    const params = [] as string[];
    const secret = [`${method}${urlTo}`];
    const url = new URL(urlTo);

    if (body) {
      for (const arg in body) data.push(`${arg}=${body[arg]}`);
      body = JSON.stringify(body);
    } else {
      body = undefined;
    }

    for (const arg in args) {
      params.push(`${arg}=${args[arg]}`);
      url.searchParams.set(arg, args[arg]);
    }
    params.sort();
    data.sort();

    if (params.length) secret.push(`?${params.join('&')}`);

    secret.push(`${time}`);
    secret.push(`${data.join('&')}`);
    const signtmp = this.secret(secret.join(''));

    const headers = {
      'FC-ACCESS-KEY': this.UserConfig.Key,
      'FC-ACCESS-SIGNATURE': signtmp,
      'FC-ACCESS-TIMESTAMP': time,
      'Content-Type': 'application/json;charset=UTF-8',
    };

    return new Promise<FcoinApiRes<any>>(resolve => {
      fetch(url.href, {
        method,
        body,
        headers,
        agent: this.Agent,
      }).then(res => res.json()).then(res => {
        if (res.status === 'ok') res.status = 0; // 强制统一。这破FCoin的规范
        if (res.status) return resolve(new FcoinApiRes(null, res, res.msg));
        return resolve(res);
      }).catch(reason => {
        reason.status = -500;
        return resolve(new FcoinApiRes(null, reason, reason.message));
      });
    });
  }

  /**
   * 创建订单（买卖）
   */
  async OrderCreate (symbol: SymbolEnum, side: SideEnum, type = 'limit', price: string, amount: string, exchange: string, account_type?: string) {
    const data: any = { symbol, side, type, price, amount, exchange };
    if (account_type) data.account_type = account_type;
    return this.fetch('POST', `${FCoinUrl.ApiV2}/orders`, data).then(res => res as FcoinApiRes<string>);
  }

  /**
   * 撤销订单（买卖）
   */
  async OrderCancel (id: string) {
    return this.fetch('POST', `${FCoinUrl.ApiV2}/orders/${id}/submit-cancel`).then(res => res as FcoinApiRes<{
      price: string,
      fill_fees: string,
      filled_amount: string,
      side: SideEnum,
      type: string,
      created_at: number,
    }>);
  }

  async FetchCandle (symbol: string, resolution = CandleResolution.M1, limit = 20, before = '') {
    const params = { limit };
    if (before) Object.assign(params, { before });
    return this.fetch('GET', `${FCoinUrl.ApiV2}/market/candles/${resolution}/${symbol}`, null, params).then(res => res as FcoinApiRes<{
      id: number; // 1540809840,
      seq: number; // 24793830600000,
      high: number; // 6491.74,
      low: number; // 6489.24,
      open: number; // 6491.24,
      close: number; // 6490.07,
      count: number; // 26,
      base_vol: number; // 8.2221,
      quote_vol: number; // 53371.531286
    }[]>);
  }

  // 查询账户资产
  async FetchBalance () {
    return this.fetch('GET', `${FCoinUrl.ApiV2}/accounts/balance`).then(res => res as FcoinApiRes<CoinHas[]>);
  }

  // 查询所有订单
  async FetchOrders (symbol: SymbolEnum, states = 'submitted,filled', limit = '100', time?: { value: number; type: 'after' | 'before' }) {
    const params = { symbol, states, limit };
    if (time) Object.assign(params, { [time.type]: time.value.toString() });
    return this.fetch('GET', `${FCoinUrl.ApiV2}/orders`, null, params).then(res => res as FcoinApiRes<OrderResult[]>);
  }

  // 查询杠杠账户信息
  async FetchLeveragedBalances (): Promise<FcoinApiRes<LeveragedBalance[]>> {
    return this.fetch('GET', `${FCoinUrl.ApiV2}/broker/leveraged_accounts`, null, null).then(res => {
      if (res.status) return res as FcoinApiRes<LeveragedBalance[]>;
      return new FcoinApiRes(res.data.map((data: any) => {
        const states = (data.state as string || '').split(',');
        data.state = {
          open: false,
          close: false,
          normal: false,
          blow_up: false,
          overrun: false,
        };
        states.forEach(state => {
          data.state[state] = true;
        });
        return data;
      }));
    });
  }

  // 查询杠杠账户指定币种信息
  async FetchLeveragedBalance (account_type: string): Promise<FcoinApiRes<LeveragedBalance>> {
    return this.fetch('GET', `${FCoinUrl.ApiV2}/broker/leveraged_accounts/account`, null, { account_type }).then(res => {
      if (res.status) return res as FcoinApiRes<LeveragedBalance>;
      const states = (res.data.state as string || '').split(',');
      res.data.state = {
        open: false,
        close: false,
        normal: false,
        blow_up: false,
        overrun: false,
      };
      states.forEach(state => {
        res.data.state[state] = true;
      });
      return new FcoinApiRes(res.data);
    });
  }

  // 获取指定 id 的订单
  async FetchOrderById (id: string) {
    return this.fetch('GET', `${FCoinUrl.ApiV2}/orders/${id}`).then(res => res as FcoinApiRes<OrderResult>);
  }

  /**
   * 行情接口(ticker)
   */
  async Ticker (symbol: SymbolEnum) {
    return this.fetch('GET', `${FCoinUrl.ApiV2}/market/ticker/${symbol}`).then(res => {
      if (res.status) return res as FcoinApiRes<TickerData>;
      const ticker = res.data.ticker;
      return new FcoinApiRes({
        seq: res.data.seq,
        type: res.data.type,
        LastPrice: ticker[0], // 最新成交价
        LastVolume: ticker[1], // 最近一笔成交量
        MaxBuyPrice: ticker[2], // 最大买一价格
        MaxBuyVolume: ticker[3], // 最大买一量
        MinSalePrice: ticker[4], // 最小卖一价格
        MinSaleVolume: ticker[5], // 最小卖一量
        BeforeH24Price: ticker[6], // 24小时前成交价
        HighestH24Price: ticker[7], // 24小时内最高价
        LowestH24Price: ticker[8], // 24小时内最低价
        OneDayVolume1: ticker[9], // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
        OneDayVolume2: ticker[10], // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
      });
    });
  }

  /**
   * 深度查询
   */
  async Depth (symbol: SymbolEnum, deep: DepthLevel) {
    return this.fetch('GET', `${FCoinUrl.ApiV2}/market/depth/${deep}/${symbol}`).then(res => {
      if (res.status) return res as FcoinApiRes<DepthData>;
      const bids: DepthUnit[] = [];
      const asks: DepthUnit[] = [];
      (res.data.bids as number[]).forEach((num, index) => {
        const isVol = Boolean(index % 2);
        const realIndex = Math.floor(index / 2);
        if (!isVol) {
          bids.push({ price: num, vol: 0 });
        } else {
          bids[realIndex].vol = num;
        }
      });
      (res.data.asks as number[]).forEach((num, index) => {
        const isVol = Boolean(index % 2);
        const realIndex = Math.floor(index / 2);
        if (!isVol) {
          asks.push({ price: num, vol: 0 });
        } else {
          asks[realIndex].vol = num;
        }
      });
      return new FcoinApiRes<DepthData>({
        bids, asks,
        seq: res.data.seq,
        ts: res.data.ts,
        type: res.data.type,
      });
    });
  }

  // 工具类
  private tob64 (str: string) {
    return new Buffer(str).toString('base64');
  }

  private secret (str: string) {
    str = this.tob64(str);
    str = crypto.createHmac('sha1', this.UserConfig.Secret).update(str).digest().toString('base64');
    return str;
  }
}
