"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCoinOriginUrl = {
    ApiV2: 'https://api.fcoin.com/v2',
    market: 'wss://api.fcoin.com/v2/ws',
};
exports.FCoinUrl = {
    ApiV2: 'https://api.fcoin.com/v2',
    market: 'wss://api.fcoin.com/v2/ws',
};
exports.SetFcoinDomain = (url) => {
    exports.FCoinUrl.ApiV2 = exports.FCoinUrl.ApiV2.replace('.fcoin.com', `.${url}`);
    exports.FCoinUrl.market = exports.FCoinUrl.market.replace('.fcoin.com', `.${url}`);
};
//# sourceMappingURL=index.js.map