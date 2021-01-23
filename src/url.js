export const url_status = /^(https:)?\/\/api\.bilibili\.com\/pgc\/view\/web\/season\/user\/status\?.*/;
export const url_play = /^(https:)?\/\/api\.bilibili\.com\/pgc\/player\/web\/playurl\?.*/;
export const url_season = /^(https:)?\/\/api\.bilibili\.com\/pgc\/view\/web\/season\?.*/;

export const url_api_replace = /^(https:)?\/\/api\.bilibili\.com\//;

function build_replace_api(region) {
  return function (str, schema) {
    if (schema) return schema + '//bilibili-' + region + '-api.kghost.info/';
    else return '//bilibili-' + region + '-api.kghost.info/';
  };
}

export const url_replace_to = [
  [
    // TW
    [/僅.*台/],
    {
      api: build_replace_api('tw'),
    },
  ],
  [
    // HK
    [/僅.*港/],
    {
      api: build_replace_api('hk'),
    },
  ],
  [
    // SG
    [/仅限东南亚/],
    {
      api: build_replace_api('sg'),
    },
  ],
  [
    // CN
    [/^((?!僅).)*$/],
    {
      api: build_replace_api('cn'),
    },
  ],
];
