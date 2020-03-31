export const url_status = [
  /^https:\/\/bangumi\.bilibili\.com\/view\/web_api\/season\/user\/status\?.*/,
  /^https:\/\/api\.bilibili\.com\/pgc\/view\/web\/season\/user\/status\?.*/,
];

export const url_play = /^https:\/\/api\.bilibili\.com\/pgc\/player\/web\/playurl\?.*/;

export const url_api_replace = /^https:\/\/api\.bilibili\.com\//;

export const url_replace_to = [
  [
    // TW
    [/僅.*台/],
    {
      api: 'https://bilibili-tw-api.kghost.info/',
    },
  ],
  [
    // HK
    [/僅.*港/],
    {
      api: 'https://bilibili-hk-api.kghost.info/',
    },
  ],
  [
    // SG
    [/仅限东南亚/],
    {
      api: 'https://bilibili-sg-api.kghost.info/',
    },
  ],
  [
    // CN
    [/^((?!僅).)*$/],
    {
      api: 'https://bilibili-cn-api.kghost.info/',
    },
  ],
];
