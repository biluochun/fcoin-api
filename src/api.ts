import crypto from 'crypto';
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { SymbolEnum, SideEnum, DepthLevel, DepthUnit, FcoinApiRes, CoinHas, OrderResult, TickerData, DepthData } from './types';
import { FCoinUrl } from '.';


export class FCoinApi {
  private UserConfig = {
    Key: '',
    Secret: '',
  };

  axios: AxiosInstance;

  constructor (key: string, secret: string) {
    this.UserConfig.Key = key;
    this.UserConfig.Secret = secret;
    this.axios = Axios.create({
      baseURL: FCoinUrl.ApiV2,
      timeout: 10000,
    });
    this.axios.interceptors.request.use((request) => this.transformRequest(request), (err) => this.onRejected(err));
    this.axios.interceptors.response.use((response) => this.transformResponse(response), (err) => this.onRejected(err));
  }

  private transformRequest (request: AxiosRequestConfig): AxiosRequestConfig {
    const time = Date.now().toString();
    const data = [] as string[];
    const params = [] as string[];
    const secret = [`${request.method!.toLocaleUpperCase()}${request.baseURL}${request.url}`];

    if (request.data) {
      for (const arg in request.data) data.push(`${arg}=${request.data[arg]}`);
      request.data = JSON.stringify(request.data);
    }

    for (const arg in request.params) params.push(`${arg}=${request.params[arg]}`);
    params.sort();
    data.sort();

    if (params.length) secret.push(`?${params.join('&')}`);
    secret.push(`${time}`);
    secret.push(`${data.join('&')}`);
    const signtmp = this.secret(secret.join(''));

    request.headers = Object.assign({}, request.headers, {
      'FC-ACCESS-KEY': this.UserConfig.Key,
      'FC-ACCESS-SIGNATURE': signtmp,
      'FC-ACCESS-TIMESTAMP': time,
      'Content-Type': 'application/json;charset=UTF-8',
    });
    return request;
  }

  private transformResponse (res: AxiosResponse): AxiosResponse {
    if (res.data.status) {
      res.data = new FcoinApiRes(null, res.data, res.data.msg);
    }
    return res;
  }

  private onRejected (err: any) {
    return Promise.resolve({ data: new FcoinApiRes(null, { status: 1, err }, err + '') });
  }

  /**
   * 创建订单（买卖）
   */
  async OrderCreate (symbol: SymbolEnum, side: SideEnum, type = 'limit', price: string, amount: string, exchange: string) {
    return this.axios.post('/orders', { symbol, side, type, price, amount, exchange }).then(res => res.data as FcoinApiRes<string>);
  }

  /**
   * 撤销订单（买卖）
   */
  async OrderCancel (id: string) {
    return this.axios.post(`/orders/${id}/submit-cancel`).then(res => res.data as FcoinApiRes<{
      price: string,
      fill_fees: string,
      filled_amount: string,
      side: SideEnum,
      type: string,
      created_at: number,
    }>);
  }

  // 查询账户资产
  async FetchBalance () {
    return this.axios.get(`/accounts/balance`).then(res => res.data as FcoinApiRes<CoinHas[]>);
  }

  // 查询所有订单
  async FetchOrders (symbol: SymbolEnum, states = 'submitted,filled', limit = '100', time?: { value: number; type: 'after' | 'before' }) {
    const params = { symbol, states, limit };
    if (time) Object.assign(params, { [time.type]: time.value.toString() });
    return this.axios.get('/orders', { params }).then(res => res.data as FcoinApiRes<OrderResult[]>);
  }

  // 获取指定 id 的订单
  async FetchOrderById (id: string) {
    return this.axios.get(`/orders/${id}`).then(res => res.data as FcoinApiRes<OrderResult>);
  }

  /**
   * 行情接口(ticker)
   */
  async Ticker (symbol: SymbolEnum) {
    return this.axios.get(`/market/ticker/${symbol}`).then(res => res.data).then(res => {
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
    return this.axios.get(`/market/depth/${deep}/${symbol}`).then(res => res.data).then(res => {
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
