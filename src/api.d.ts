import { AxiosInstance } from 'axios';
import { SymbolEnum, SideEnum, DepthLevel, FcoinApiRes, CoinHas, OrderResult, DepthData } from './types';
export declare class FCoinApi {
    private UserConfig;
    axios: AxiosInstance;
    constructor(key: string, secret: string);
    private transformRequest;
    private transformResponse;
    private onRejected;
    /**
     * 创建订单（买卖）
     */
    OrderCreate(symbol: SymbolEnum, side: SideEnum, type: string | undefined, price: string, amount: string, exchange: string): Promise<FcoinApiRes<string>>;
    /**
     * 撤销订单（买卖）
     */
    OrderCancel(id: string): Promise<FcoinApiRes<{
        price: string;
        fill_fees: string;
        filled_amount: string;
        side: SideEnum;
        type: string;
        created_at: number;
    }>>;
    FetchBalance(): Promise<FcoinApiRes<CoinHas[]>>;
    FetchOrders(symbol: SymbolEnum, states?: string, limit?: string, time?: {
        value: number;
        type: 'after' | 'before';
    }): Promise<FcoinApiRes<OrderResult[]>>;
    FetchOrderById(id: string): Promise<FcoinApiRes<OrderResult>>;
    /**
     * 行情接口(ticker)
     */
    Ticker(symbol: SymbolEnum): Promise<FcoinApiRes<{
        seq: any;
        type: any;
        LastPrice: any;
        LastVolume: any;
        MaxBuyPrice: any;
        MaxBuyVolume: any;
        MinSalePrice: any;
        MinSaleVolume: any;
        BeforeH24Price: any;
        HighestH24Price: any;
        LowestH24Price: any;
        OneDayVolume1: any;
        OneDayVolume2: any;
    }>>;
    /**
     * 深度查询
     */
    Depth(symbol: SymbolEnum, deep: DepthLevel): Promise<FcoinApiRes<DepthData>>;
    private tob64;
    private secret;
}
