export declare enum BrocastType {
    hello = "hello",
    ping = "ping",
    topics = "topics"
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
export declare type SymbolEnum = string;
export declare enum SideEnum {
    Sell = "sell",
    Buy = "buy"
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
export declare enum DepthLevel {
    L20 = "L20",
    L100 = "L100",
    FULL = "full"
}
/**
 * 实时数据
 */
export interface WsResponseTicker extends WsResponse {
    seq: number;
    ticker: {
        LastPrice: number;
        LastVolume: number;
        MaxBuyPrice: number;
        MaxBuyVolume: number;
        MinSalePrice: number;
        MinSaleVolume: number;
        BeforeH24Price: number;
        HighestH24Price: number;
        LowestH24Price: number;
        OneDayVolume1: number;
        OneDayVolume2: number;
    };
}
export interface WsResponseAllTickers {
    symbol: string;
    ticker: {
        LastPrice: number;
        LastVolume: number;
        MaxBuyPrice: number;
        MaxBuyVolume: number;
        MinSalePrice: number;
        MinSaleVolume: number;
        BeforeH24Price: number;
        HighestH24Price: number;
        LowestH24Price: number;
        OneDayVolume1: number;
        OneDayVolume2: number;
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
export declare enum CandleResolution {
    M1 = "M1",
    M3 = "M3",
    M5 = "M5",
    M15 = "M15",
    M30 = "M30",
    H1 = "H1",
    H4 = "H4",
    H6 = "H6",
    D1 = "D1",
    W1 = "W1",
    MN = "MN"
}
export declare enum OrderState {
    submitted = "submitted",
    partial_filled = "partial_filled",
    partial_canceled = "partial_canceled",
    filled = "filled",
    canceled = "canceled",
    pending_cancel = "pending_cancel"
}
export declare class FcoinApiRes<T> {
    data: T;
    status: number;
    full: any;
    msg: string;
    constructor(data: T, full?: any, msg?: string);
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
    fees_income: string;
    exchange: string;
    filled_amount: string;
    created_at: number;
    source: string;
}
export interface TickerData {
    seq: number;
    type: string;
    LastPrice: number;
    LastVolume: number;
    MaxBuyPrice: number;
    MaxBuyVolume: number;
    MinSalePrice: number;
    MinSaleVolume: number;
    BeforeH24Price: number;
    HighestH24Price: number;
    LowestH24Price: number;
    OneDayVolume1: number;
    OneDayVolume2: number;
}
export interface DepthData {
    bids: DepthUnit[];
    asks: DepthUnit[];
    seq: number;
    ts: number;
    type: string;
}
