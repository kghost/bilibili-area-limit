export const url_status = [
  /^https:\/\/bangumi\.bilibili\.com\/view\/web_api\/season\/user\/status\?.*/,
  /^https:\/\/api\.bilibili\.com\/pgc\/view\/web\/season\/user\/status\?.*/,
];

export const url_play = /^https:\/\/api\.bilibili\.com\/pgc\/player\/web\/playurl\?.*/;

export const url_api_replace = /^https:\/\/api\.bilibili\.com\//;
export const url_www_replace = /^https:\/\/www\.bilibili\.com\//;

export const url_replace_to = [
  [
    // HK
    [/僅.*港/],
    {
      www: 'https://bilibili-hk-www.kghost.info/',
      api: 'https://bilibili-hk-api.kghost.info/',
    },
  ],
  [
    // TW
    [/僅.*台/],
    {
      www: 'https://bilibili-tw-www.kghost.info/',
      api: 'https://bilibili-tw-api.kghost.info/',
    },
  ],
  [
    // SG
    [/仅限东南亚/],
    {
      www: 'https://bilibili-sg-www.kghost.info/',
      api: 'https://bilibili-sg-api.kghost.info/',
    },
  ],
  [
    // CN
    [/^((?!僅).)*$/],
    {
      www: 'https://bilibili-cn-www.kghost.info/',
      api: 'https://bilibili-cn-api.kghost.info/',
    },
  ],
];
