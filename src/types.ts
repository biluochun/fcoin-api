
export enum BrocastType {
  hello = 'hello',
  ping = 'ping',
  topics = 'topics',
}

/**
 * ws返回数据格式
 */
export interface WsResponse {
  type: BrocastType;
  ts: number;
  topic?: string;
}

/**
 * 交易对枚举
 */
// export enum SymbolEnum {
//   FtUsdt = 'ftusdt',
// }
export type SymbolEnum = string;

export enum SideEnum {
  Sell = 'sell',
  Buy = 'buy',
}

/**
 * 监听
 */
export interface WatchTicker<T> {
  (data: T): any;
}

/**
 * 行情深度
 */
export enum DepthLevel {
  L20 = 'L20',
  L100 = 'L100',
  FULL = 'full',
}

/**
 * 实时数据
 */
export interface WsResponseTicker extends WsResponse {
  seq: number;
  ticker: {
    LastPrice: number; // 最新成交价
    LastVolume: number; // 最近一笔成交量
    MaxBuyPrice: number; // 最大买一价格
    MaxBuyVolume: number; // 最大买一量
    MinSalePrice: number; // 最小卖一价格
    MinSaleVolume: number; // 最小卖一量
    BeforeH24Price: number; // 24小时前成交价
    HighestH24Price: number; // 24小时内最高价
    LowestH24Price: number; // 24小时内最低价
    OneDayVolume1: number; // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
    OneDayVolume2: number; // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
  };
}

export interface WsResponseAllTickers {
  symbol: string;
  ticker: {
    LastPrice: number; // 最新成交价
    LastVolume: number; // 最近一笔成交量
    MaxBuyPrice: number; // 最大买一价格
    MaxBuyVolume: number; // 最大买一量
    MinSalePrice: number; // 最小卖一价格
    MinSaleVolume: number; // 最小卖一量
    BeforeH24Price: number; // 24小时前成交价
    HighestH24Price: number; // 24小时内最高价
    LowestH24Price: number; // 24小时内最低价
    OneDayVolume1: number; // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
    OneDayVolume2: number; // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
  };
}

/**
 * 交易深度数据
 */
export interface WsResponseDepth extends WsResponse {
  seq: number;
  asks: DepthUnit[];
  bids: DepthUnit[];
}

/**
 * 单项价格的深度
 */
export interface DepthUnit {
  price: number;
  vol: number;
}

/**
 * 交易记录
 */
export interface WsResponseTrade extends WsResponse {
  id: number;
  amount: number;
  side: SideEnum;
  price: number;
}

/**
 * K线数据
 */
export interface WsResponseCandle extends WsResponse {
  id: number;
  seq: number;
  open: number;
  close: number;
  high: number;
  low: number;
  count: number;
  base_vol: number;
  quote_vol: number;
}

/**
 * M1	1 分钟
 * M3	3 分钟
 * M5	5 分钟
 * M15	15 分钟
 * M30	30 分钟
 * H1	1 小时
 * H4	4 小时
 * H6	6 小时
 * D1	1 日
 * W1	1 周
 * MN	1 月
 */
export enum CandleResolution {
  M1 = 'M1',
  M3 = 'M3',
  M5 = 'M5',
  M15 = 'M15',
  M30 = 'M30',
  H1 = 'H1',
  H4 = 'H4',
  H6 = 'H6',
  D1 = 'D1',
  W1 = 'W1',
  MN = 'MN',
}

export enum OrderState {
  submitted = 'submitted', //  已提交
  partial_filled = 'partial_filled', // 部分成交
  partial_canceled = 'partial_canceled', // 部分成交已撤销
  filled = 'filled', // 完全成交
  canceled = 'canceled', // 已撤销
  pending_cancel = 'pending_cancel', // 撤销已提交
}

export class FcoinApiRes<T> {
  data: T;
  status: number;
  full: any;
  msg: string;

  constructor (data: T, full: any = null, msg = '') {
    this.data = data;
    this.status = full ? full.status : 0;
    this.full = full;
    this.msg = msg;
  }
}

export interface CoinHas {
  currency: string;
  category: string;
  available: string;
  frozen: string;
  balance: string;
}

export interface OrderResult {
  id: string;
  symbol: string;
  type: 'limit' | 'market';
  side: SideEnum;
  price: string;
  amount: string;
  state: OrderState;
  executed_value: string;
  fill_fees: string;
  fees_income: string; // 返手续费
  exchange: string; // 专区
  filled_amount: string;
  created_at: number;
  source: string;
}

export interface TickerData {
  seq: number;
  type: string;
  LastPrice: number; // 最新成交价
  LastVolume: number; // 最近一笔成交量
  MaxBuyPrice: number; // 最大买一价格
  MaxBuyVolume: number; // 最大买一量
  MinSalePrice: number; // 最小卖一价格
  MinSaleVolume: number; // 最小卖一量
  BeforeH24Price: number; // 24小时前成交价
  HighestH24Price: number; // 24小时内最高价
  LowestH24Price: number; // 24小时内最低价
  OneDayVolume1: number; // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
  OneDayVolume2: number; // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
}

export interface DepthData {
  bids: DepthUnit[];
  asks: DepthUnit[];
  seq: number;
  ts: number;
  type: string;
};

export enum LeveragedBalanceState {
  open = 'open',
  close = 'close',
  normal = 'normal',
  blow_up = 'blow_up',
  overrun = 'overrun',
}

export const LeveragedBalanceStateText = {
  open: '已开通-未发生借贷',
  close: '已关闭',
  normal: '已借贷-风险率正常',
  blow_up: '已爆仓',
  overrun: '已穿仓',
}
export interface LeveragedBalance {
  open: boolean;                                     // 是否已经开通该类型杠杆账户. true:已开通;false:未开通
  leveraged_account_type: string;              // 杠杆账户类型
  base: string;                                    // 基准币种
  quote: string;                                  // 计价币种
  available_base_currency_amount: string;      // 可用的基准币种资产
  frozen_base_currency_amount: string;               // 冻结的基准币种资产
  available_quote_currency_amount: string;      // 可用的计价币种资产
  frozen_quote_currency_amount: string;              // 冻结的计价币种资产
  available_base_currency_loan_amount: string;   // 可借的基准币种数量
  available_quote_currency_loan_amount: string; // 可借的计价币种数量
  blow_up_price: string;                            // 爆仓价
  risk_rate: string;                              // 爆仓风险率
  // 账户状态. close 已关闭;open 已开通-未发生借贷;normal 已借贷-风险率正常;blow_up 已爆仓;overrun 已穿仓", allowableValues = "close,open,normal,blow_up,overrun")
  state: {
    open: boolean;
    close: boolean;
    normal: boolean;
    blow_up: boolean;
    overrun: boolean;
  };
}
