"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const types_1 = require("./types");
const _1 = require(".");
const url_1 = require("url");
class FCoinApi {
    constructor(key, secret, agent, Domain = 'fcoin.com', SDomain = 'fcoin.com') {
        this.UserConfig = {
            Key: '',
            Secret: '',
        };
        this.Agent = undefined;
        this.Domain = '';
        this.SDomain = '';
        this.UserConfig.Key = key;
        this.UserConfig.Secret = secret;
        this.Agent = agent;
        this.Domain = Domain;
        this.SDomain = this.SDomain;
        // this.axios = Axios.create({
        //   baseURL: FCoinUrl.ApiV2,
        //   timeout: 10000,
        // });
        // this.axios.interceptors.request.use((request) => this.transformRequest(request), (err) => this.onRejected(err));
        // this.axios.interceptors.response.use((response) => this.transformResponse(response), (err) => this.onRejected(err));
    }
    fetch(method, urlTo, body, args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const time = Date.now().toString();
            const data = [];
            const params = [];
            urlTo = urlTo.replace('fcoin.com', this.Domain);
            const secret = [`${method}${urlTo.replace(this.Domain, this.SDomain)}`];
            const url = new url_1.URL(urlTo);
            if (body) {
                for (const arg in body)
                    data.push(`${arg}=${body[arg]}`);
                body = JSON.stringify(body);
            }
            else {
                body = undefined;
            }
            for (const arg in args) {
                params.push(`${arg}=${args[arg]}`);
                url.searchParams.set(arg, args[arg]);
            }
            params.sort();
            data.sort();
            if (params.length)
                secret.push(`?${params.join('&')}`);
            secret.push(`${time}`);
            secret.push(`${data.join('&')}`);
            const signtmp = this.secret(secret.join(''));
            const headers = {
                'FC-ACCESS-KEY': this.UserConfig.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
                'Content-Type': 'application/json;charset=UTF-8',
            };
            return new Promise(resolve => {
                node_fetch_1.default(url.href, {
                    method,
                    body,
                    headers,
                    agent: this.Agent,
                }).then(res => res.json()).then(res => {
                    if (res.status === 'ok')
                        res.status = 0; // 强制统一。这破FCoin的规范
                    if (res.status)
                        return resolve(new types_1.FcoinApiRes(null, res, res.msg));
                    return resolve(res);
                }).catch(reason => {
                    reason.status = -500;
                    return resolve(new types_1.FcoinApiRes(null, reason, reason.message));
                });
            });
        });
    }
    /**
     * 创建订单（买卖）
     */
    OrderCreate(symbol, side, type = 'limit', price, amount, exchange, account_type) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = { symbol, side, type, price, amount, exchange };
            if (account_type)
                data.account_type = account_type;
            return this.fetch('POST', `${_1.FCoinUrl.ApiV2}/orders`, data).then(res => res);
        });
    }
    /**
     * 撤销订单（买卖）
     */
    OrderCancel(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('POST', `${_1.FCoinUrl.ApiV2}/orders/${id}/submit-cancel`).then(res => res);
        });
    }
    FetchCandle(symbol, resolution = types_1.CandleResolution.M1, limit = 20, before = '') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = { limit };
            if (before)
                Object.assign(params, { before });
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/market/candles/${resolution}/${symbol}`, null, params).then(res => res);
        });
    }
    // 查询账户资产
    FetchBalance() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/accounts/balance`).then(res => res);
        });
    }
    // 查询钱包资产
    FetchBalance2() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/assets/accounts/balance`).then(res => res);
        });
    }
    // 钱包到交易账户
    Assets2Spot(currency, amount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('POST', `${_1.FCoinUrl.ApiV2}/assets/accounts/assets-to-spot`, { currency, amount }).then(res => res);
        });
    }
    // 交易账户到钱包
    Spot2Assets(currency, amount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('POST', `${_1.FCoinUrl.ApiV2}/accounts/spot-to-assets`, { currency, amount }).then(res => res);
        });
    }
    // 查询所有订单
    FetchOrders(symbol, states = 'submitted,filled', limit = '100', time) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = { symbol, states, limit };
            if (time)
                Object.assign(params, { [time.type]: time.value.toString() });
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/orders`, null, params).then(res => res);
        });
    }
    // 查询杠杠账户信息
    FetchLeveragedBalances() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/broker/leveraged_accounts`, null, null).then(res => {
                if (res.status)
                    return res;
                return new types_1.FcoinApiRes(res.data.map((data) => {
                    const states = (data.state || '').split(',');
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
        });
    }
    // 查询杠杠账户指定币种信息
    FetchLeveragedBalance(account_type) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/broker/leveraged_accounts/account`, null, { account_type }).then(res => {
                if (res.status)
                    return res;
                const states = (res.data.state || '').split(',');
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
                return new types_1.FcoinApiRes(res.data);
            });
        });
    }
    // 获取指定 id 的订单
    FetchOrderById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/orders/${id}`).then(res => res);
        });
    }
    /**
     * 行情接口(ticker)
     */
    Ticker(symbol) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/market/ticker/${symbol}`).then(res => {
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
            return this.fetch('GET', `${_1.FCoinUrl.ApiV2}/market/depth/${deep}/${symbol}`).then(res => {
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