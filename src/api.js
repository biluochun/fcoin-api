"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const types_1 = require("./types");
const _1 = require(".");
class FCoinApi {
    constructor(key, secret) {
        this.UserConfig = {
            Key: '',
            Secret: '',
        };
        this.UserConfig.Key = key;
        this.UserConfig.Secret = secret;
        this.axios = axios_1.default.create({
            baseURL: _1.FCoinUrl.ApiV2,
            timeout: 10000,
        });
        this.axios.interceptors.request.use((request) => this.transformRequest(request), (err) => this.onRejected(err));
        this.axios.interceptors.response.use((response) => this.transformResponse(response), (err) => this.onRejected(err));
    }
    transformRequest(request) {
        const time = Date.now().toString();
        const data = [];
        const params = [];
        const secret = [`${request.method.toLocaleUpperCase()}${request.baseURL}${request.url}`];
        if (request.data) {
            for (const arg in request.data)
                data.push(`${arg}=${request.data[arg]}`);
            request.data = JSON.stringify(request.data);
        }
        for (const arg in request.params)
            params.push(`${arg}=${request.params[arg]}`);
        params.sort();
        data.sort();
        if (params.length)
            secret.push(`?${params.join('&')}`);
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
    transformResponse(res) {
        if (res.data.status) {
            res.data = new types_1.FcoinApiRes(null, res.data, res.data.msg);
        }
        return res;
    }
    onRejected(err) {
        return Promise.resolve({ data: new types_1.FcoinApiRes(null, { status: 1, err }, err + '') });
    }
    /**
     * 创建订单（买卖）
     */
    OrderCreate(symbol, side, type = 'limit', price, amount, exchange) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.axios.post('/orders', { symbol, side, type, price, amount, exchange }).then(res => res.data);
        });
    }
    /**
     * 撤销订单（买卖）
     */
    OrderCancel(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.axios.post(`/orders/${id}/submit-cancel`).then(res => res.data);
        });
    }
    // 查询账户资产
    FetchBalance() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/accounts/balance`).then(res => res.data);
        });
    }
    // 查询所有订单
    FetchOrders(symbol, states = 'submitted,filled', limit = '100', time) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = { symbol, states, limit };
            if (time)
                Object.assign(params, { [time.type]: time.value.toString() });
            return this.axios.get('/orders', { params }).then(res => res.data);
        });
    }
    // 获取指定 id 的订单
    FetchOrderById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/orders/${id}`).then(res => res.data);
        });
    }
    /**
     * 行情接口(ticker)
     */
    Ticker(symbol) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/market/ticker/${symbol}`).then(res => res.data).then(res => {
                if (res.status)
                    return res;
                const ticker = res.data.ticker;
                return new types_1.FcoinApiRes({
                    seq: res.data.seq,
                    type: res.data.type,
                    LastPrice: ticker[0],
                    LastVolume: ticker[1],
                    MaxBuyPrice: ticker[2],
                    MaxBuyVolume: ticker[3],
                    MinSalePrice: ticker[4],
                    MinSaleVolume: ticker[5],
                    BeforeH24Price: ticker[6],
                    HighestH24Price: ticker[7],
                    LowestH24Price: ticker[8],
                    OneDayVolume1: ticker[9],
                    OneDayVolume2: ticker[10],
                });
            });
        });
    }
    /**
     * 深度查询
     */
    Depth(symbol, deep) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/market/depth/${deep}/${symbol}`).then(res => res.data).then(res => {
                if (res.status)
                    return res;
                const bids = [];
                const asks = [];
                res.data.bids.forEach((num, index) => {
                    const isVol = Boolean(index % 2);
                    const realIndex = Math.floor(index / 2);
                    if (!isVol) {
                        bids.push({ price: num, vol: 0 });
                    }
                    else {
                        bids[realIndex].vol = num;
                    }
                });
                res.data.asks.forEach((num, index) => {
                    const isVol = Boolean(index % 2);
                    const realIndex = Math.floor(index / 2);
                    if (!isVol) {
                        asks.push({ price: num, vol: 0 });
                    }
                    else {
                        asks[realIndex].vol = num;
                    }
                });
                return new types_1.FcoinApiRes({
                    bids, asks,
                    seq: res.data.seq,
                    ts: res.data.ts,
                    type: res.data.type,
                });
            });
        });
    }
    // 工具类
    tob64(str) {
        return new Buffer(str).toString('base64');
    }
    secret(str) {
        str = this.tob64(str);
        str = crypto_1.default.createHmac('sha1', this.UserConfig.Secret).update(str).digest().toString('base64');
        return str;
    }
}
exports.FCoinApi = FCoinApi;
//# sourceMappingURL=api.js.map