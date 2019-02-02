"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ws_1 = tslib_1.__importDefault(require("ws"));
const types_1 = require("./types");
const _1 = require(".");
/**
 * topic 表示订阅的主题
 * symbol 表示对应交易币种. 所有币种区分的 topic 都在 topic 末尾.
 * ticker 行情 tick 信息, 包含最新成交价, 最新成交量, 买一卖一, 近 24 小时成交量.
 * depth 表示行情深度, 买卖盘, 盘口.
 * level 表示行情深度类型. 如 L20, L100.
 * trade 表示最新成交, 最新交易.
 * candle 表示蜡烛图, 蜡烛棒, K 线.
 * resolution 表示蜡烛图的种类. 如 M1, M15.
 * base volume 表示基准货币成交量, 如 btcusdt 中 btc 的量.
 * quote volume 表示计价货币成交量, 如 btcusdt 中 usdt 的量
 * ts 表示推送服务器的时间. 是毫秒为单位的数字型字段, unix epoch in millisecond.
 * {"cmd":"sub","args":["all-tickers"]}
 * {"cmd":"sub","args":["depth.L20.ftusdt"]}
 * {"cmd":"sub","args":["ticker.ftusdt"]}
 * {"cmd":"req","args":["trade.ftusdt",40],"id":"trade-history"}
 * {"cmd":"sub","args":["trade.ftusdt"]}
 * {"cmd":"ping","args":[1531375817736]}
 */
class FcoinWebSocket {
    constructor(options) {
        this.typeListen = {};
        // 最后一次呼吸返回
        this.LastHeartbeat = {
            id: '',
            type: 'ping',
            ts: Date.now(),
            gap: 0,
            timer: 0,
        };
        this.ws = new ws_1.default(_1.FCoinUrl.market, options);
        this.wsOpen = new Promise(resolve => {
            this.ws.on('open', resolve);
        });
        this.Listen();
    }
    HeartbeatInit(time) {
        clearInterval(this.LastHeartbeat.timer);
        this.LastHeartbeat.timer = setInterval(() => this.Heartbeat(), time);
    }
    Heartbeat() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.wsOpen;
            this.ws.send(JSON.stringify({ cmd: 'ping', args: [Date.now()], id: `${Date.now()}` }));
        });
    }
    /**
     * 监听交易对的数据
     */
    OnTicker(symbol, fun) {
        this.On((data) => {
            const ticker = data.ticker;
            fun({
                type: data.type,
                ts: data.ts,
                seq: data.seq,
                ticker: {
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
                },
            });
        }, `ticker.${symbol}`);
    }
    OnAllTickers(fun) {
        this.On((data) => {
            fun(data.tickers.map((item) => {
                const res = {
                    symbol: item.symbol,
                    ticker: {
                        LastPrice: item.ticker[0],
                        LastVolume: item.ticker[1],
                        MaxBuyPrice: item.ticker[2],
                        MaxBuyVolume: item.ticker[3],
                        MinSalePrice: item.ticker[4],
                        MinSaleVolume: item.ticker[5],
                        BeforeH24Price: item.ticker[6],
                        HighestH24Price: item.ticker[7],
                        LowestH24Price: item.ticker[8],
                        OneDayVolume1: item.ticker[9],
                        OneDayVolume2: item.ticker[10],
                    },
                };
                return res;
            }));
        }, `all-tickers`);
    }
    /**
     * 深度信息变更
     */
    OnDepth(symbol, level = types_1.DepthLevel.L20, fun) {
        this.On((data) => {
            const asks = [];
            const bids = [];
            data.bids.forEach((num, index) => {
                const isVol = Boolean(index % 2);
                const realIndex = Math.floor(index / 2);
                if (!isVol) {
                    bids.push({ price: num, vol: 0 });
                }
                else {
                    bids[realIndex].vol = num;
                }
            });
            data.asks.forEach((num, index) => {
                const isVol = Boolean(index % 2);
                const realIndex = Math.floor(index / 2);
                if (!isVol) {
                    asks.push({ price: num, vol: 0 });
                }
                else {
                    asks[realIndex].vol = num;
                }
            });
            fun({
                type: data.type,
                ts: data.ts,
                seq: data.seq,
                asks,
                bids,
            });
        }, `depth.${level}.${symbol}`);
    }
    /**
     * 交易记录
     */
    OnTrade(symbol, limit = '20', fun) {
        this.On(fun, `trade.${symbol}`, limit);
    }
    /**
     * 历史数据
     */
    OnCandle(symbol, resolution = types_1.CandleResolution.M1, fun) {
        this.On(fun, `candle.${resolution}.${symbol}`);
    }
    On(callback, ...topics) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.wsOpen;
            const name = topics[0];
            if (this.typeListen[name]) {
                this.typeListen[name].push(callback);
                return;
            }
            this.typeListen[name] = [];
            this.typeListen[name].push(callback);
            const send = { cmd: 'sub', args: topics };
            // if (send.args[0] === 'all-tickers') (send as any).id = 'tickers';
            this.ws.send(JSON.stringify(send));
        });
    }
    /**
     * 监听ws返回的数据
     */
    Listen() {
        this.ws.on('message', (msg) => {
            try {
                const data = JSON.parse(msg.toString());
                // logger.trace(`ws ${data.type}:`, data);
                // console.log(data);
                switch (data.type) {
                    case types_1.BrocastType.hello: break;
                    case types_1.BrocastType.ping:
                        this.LastHeartbeat = data;
                        break;
                    case types_1.BrocastType.topics:
                        // console.log(data);
                        break;
                    default:
                        this.TopicCallback(data);
                        break;
                }
            }
            catch (e) {
                // loggerError.error(msg, e);
                return;
            }
        });
        this.ws.on('error', (errs) => {
            // if (errs) loggerError.error(errs);
        });
    }
    TopicCallback(data) {
        let listen;
        if (data.type)
            listen = this.typeListen[data.type];
        else if (data.topic)
            listen = this.typeListen[data.topic];
        if (!listen) {
            // logger.error('未处理的消息', data);
            return;
        }
        listen.forEach(fun => fun(data));
    }
    Close() {
        this.ws.close();
        delete this.ws;
    }
}
exports.FcoinWebSocket = FcoinWebSocket;
//# sourceMappingURL=ws.js.map