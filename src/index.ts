export const FCoinOriginUrl = {
  ApiV2: 'https://api.fcoin.com/v2',
  market: 'wss://api.fcoin.com/v2/ws',
};

export const FCoinUrl = {
  ApiV2: 'https://api.fcoin.com/v2',
  market: 'wss://api.fcoin.com/v2/ws',
};

export const SetFcoinDomain = (url: string) => {
  FCoinUrl.ApiV2 = FCoinUrl.ApiV2.replace('.fcoin.com', `.${url}`);
  FCoinUrl.market = FCoinUrl.market.replace('.fcoin.com', `.${url}`);
};
