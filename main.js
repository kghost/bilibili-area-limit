// @grant       GM_notification
// ==UserScript==
// @name               Bilibili 港澳台
// @namespace          http://kghost.info/
// @version            1.0.1
// @description:       Remove area restriction
// @description:zh-CN  解除区域限制 (修正大会员限制，添加国际友人看国内功能)
// @supportURL         https://github.com/kghost/bilibili-area-limit
// @author             zealot0630
// @include            https://*.bilibili.com/*
// @run-at document-start
// @description Bilibili 港澳台, 解除区域限制 (修正大会员限制，添加国际友人看国内功能)
// @grant       GM_notification
// @grant       GM_cookie
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

const url_status = [
  /^https:\/\/bangumi\.bilibili\.com\/view\/web_api\/season\/user\/status\?.*/,
  /^https:\/\/api\.bilibili\.com\/pgc\/view\/web\/season\/user\/status\?.*/,
];
const url_play = /^https:\/\/api\.bilibili\.com\/pgc\/player\/web\/playurl\?.*/;

const url_api_replace = /^https:\/\/api\.bilibili\.com\//;
const url_www_replace = /^https:\/\/www\.bilibili\.com\//;
const url_replace_to = [
  [
    // HK
    /僅.*港.*地區/,
    {
      www: 'https://bilibili-hk-www.kghost.info/',
      api: 'https://bilibili-hk-api.kghost.info/',
      info: 'https://bilibili-hk-info.kghost.info/',
    },
  ],
  [
    // TW
    /僅.*台.*地區/,
    {
      www: 'https://bilibili-tw-www.kghost.info/',
      api: 'https://bilibili-tw-api.kghost.info/',
      info: 'https://bilibili-tw-info.kghost.info/',
    },
  ],
  [
    // CN
    /^((?!僅).)*$/,
    {
      www: 'https://bilibili-cn-www.kghost.info/',
      api: 'https://bilibili-cn-api.kghost.info/',
      info: 'https://bilibili-cn-info.kghost.info/',
    },
  ],
];

(function(XMLHttpRequest) {
  class ClassHandler {
    constructor(proxy) {
      this.proxy = proxy;
    }

    construct(target, args) {
      const obj = new target(...args);
      return new Proxy(obj, new this.proxy(obj));
    }
  }

  const ProxyGetTarget = Symbol('ProxyGetTarget');
  const ProxyGetHandler = Symbol('ProxyGetHandler');
  class ObjectHandler {
    constructor(target) {
      this.target = target;
    }

    get(target, prop, receiver) {
      if (target.hasOwnProperty(prop)) {
        return Reflect.get(target, prop, receiver);
      } else if (prop == ProxyGetTarget) {
        return target;
      } else if (prop == ProxyGetHandler) {
        return this;
      } else {
        const value = target[prop];
        if (typeof value == 'function')
          return new Proxy(value, new FunctionHandler(value));
        return value;
      }
    }

    set(target, prop, value) {
      return Reflect.set(target, prop, value);
    }
  }

  class FunctionHandlerBase extends ObjectHandler {
    apply(target, thisArg, argumentsList) {
      const realTarget = thisArg[ProxyGetTarget];
      if (!realTarget) throw new Error('illegal invocations');
      return this.call(this.target, thisArg, realTarget, argumentsList);
    }
  }

  class FunctionHandler extends FunctionHandlerBase {
    call(fn, proxy, target, argumentsList) {
      return fn.apply(target, argumentsList);
    }
  }

  class EventTargetHandler extends ObjectHandler {
    constructor(target) {
      super(target);
      this.listeners = {};
    }

    getListeners(event) {
      if (!this.listeners.hasOwnProperty(event))
        this.listeners[event] = new Map();
      return this.listeners[event];
    }

    get(target, prop, receiver) {
      if (prop === 'addEventListener') {
        return new Proxy(
          target.addEventListener,
          new this.addEventListener(target.addEventListener)
        );
      } else if (prop === 'removeEventListener') {
        return new Proxy(
          target.removeEventListener,
          new this.removeEventListener(target.removeEventListener)
        );
      } else return super.get(target, prop, receiver);
    }
  }

  EventTargetHandler.prototype.addEventListener = class extends FunctionHandlerBase {
    call(fn, proxy, realTarget, argumentsList) {
      const event = argumentsList[0];
      const listener = argumentsList[1];
      const bridge = listener.bind(proxy);
      argumentsList[1] = bridge;
      proxy[ProxyGetHandler].getListeners(event).set(listener, bridge);
      return fn.apply(realTarget, argumentsList);
    }
  };

  EventTargetHandler.prototype.removeEventListener = class extends FunctionHandlerBase {
    call(fn, proxy, realTarget, argumentsList) {
      const event = argumentsList[0];
      const listener = argumentsList[1];
      const cache = proxy[ProxyGetHandler].getListeners(event);
      if (cache.has(listener)) {
        argumentsList[1] = cache.get(listener);
        cache.delete(listener);
      }
      return fn.apply(realTarget, argumentsList);
    }
  };

  class XhrHandler extends EventTargetHandler {
    constructor(target) {
      super(target);
      this.overrideResponse = false;
      this.overrideResponseValue = null;
    }

    get(target, prop, receiver) {
      if (prop === 'open') {
        return new Proxy(target.open, new this.open(target.open));
      } else if (prop === 'response' && this.overrideResponse) {
        console.log('BAL: Return hooked area limit');
        return this.overrideResponseValue;
      } else if (prop === 'responseText' && this.overrideResponse) {
        console.log('BAL: Return hooked area limit');
        return this.overrideResponseValue;
      } else {
        return super.get(target, prop, receiver);
      }
    }
  }

  let limited = false;
  XhrHandler.prototype.open = class extends FunctionHandlerBase {
    call(fn, proxy, realTarget, argumentsList) {
      const method = argumentsList[0];
      const url = argumentsList[1];

      if (method === 'GET') {
        if (limited && url.match(url_play)) {
          for (const [match, to] of url_replace_to) {
            if (document.title.match(match)) {
              argumentsList[1] = url.replace(url_api_replace, to.api);
              console.log(`BAL: playurl via proxy ${to.api}.`);
              break;
            }
          }
        } else if (
          (function() {
            for (const status of url_status) {
              if (url.match(status)) return true;
            }
          })()
        ) {
          realTarget.addEventListener('readystatechange', () => {
            if (realTarget.readyState === 4 && realTarget.status === 200) {
              const status = JSON.parse(realTarget.response);
              if (status && status.result && status.result.area_limit === 1) {
                status.result.area_limit = 0;
                limited = true;
                console.log('BAL: Hook area limit');
                proxy[ProxyGetHandler].overrideResponse = true;
                proxy[ProxyGetHandler].overrideResponseValue = JSON.stringify(
                  status
                );
              }
            }
          });
        }
      }
      return fn.apply(realTarget, argumentsList);
    }
  };

  unsafeWindow.XMLHttpRequest = new Proxy(
    XMLHttpRequest,
    new ClassHandler(XhrHandler)
  );

  const showTamperMonkeyUpdate = () => {
    GM.getValue('__area__limit__', 0).then(last => {
      if (last > new Date().getTime() - 86400000) return;
      if (
        confirm('Bilibili　港澳台: 无法获取播放文件信息，请升级油猴到BETA版本')
      ) {
        window.open(
          'https://chrome.google.com/webstore/detail/tampermonkey-beta/gcalenpjmijncebpfijmoaglllgpjagf',
          '_blank'
        );
      } else {
        GM.setValue('__area__limit__', new Date().getTime());
      }
    });
  };

  (() => {
    var info = undefined;
    var fetching = false;
    Object.defineProperty(unsafeWindow, '__playinfo__', {
      configurable: true,
      get: function() {
        if (info) return info;
        console.log('BAL: Hook playinfo.');
        const key = '__playinfo__' + window.location.href;
        const cachedInfo = sessionStorage.getItem(key);
        if (cachedInfo) return (info = JSON.parse(cachedInfo));
        if (fetching) return undefined;
        fetching = true;
        console.log('BAL: Fetching playinfo.');

        for (const [match, to] of url_replace_to) {
          if (document.title.match(match)) {
            GM_cookie.list(
              { domain: '.bilibili.com', name: 'SESSDATA' },
              (cookies, error) => {
                if (error) {
                  if (error == 'not supported') showTamperMonkeyUpdate();
                  console.log('BAL: Error fetch info, not login');
                  return;
                }
                const target = window.location.href.replace(
                  url_www_replace,
                  to.info
                );
                const xhr = new XMLHttpRequest();
                xhr.open('GET', target);
                xhr.responseType = 'document';
                xhr.setRequestHeader('X-Cookie', cookies[0].value);
                xhr.onreadystatechange = function() {
                  if (this.readyState === xhr.DONE && this.status === 200) {
                    console.log('BAL: Info fetched ...');
                    for (const s of this.response.getElementsByTagName(
                      'script'
                    )) {
                      if (s.innerHTML.includes('__playinfo__')) {
                        eval(s.innerHTML);
                        sessionStorage.setItem(
                          key,
                          JSON.stringify(window.__playinfo__)
                        );
                        console.log('BAL: Info fetched, reload page');
                        window.location.reload();
                      }
                    }
                  }
                };
                xhr.send();
              }
            );
            break;
          }
        }
        return undefined;
      },
      set: v => (info = v),
    });
  })();

  window.addEventListener('load', () => {
    if (document.querySelector('div.error-body')) {
      // try load via proxy
      console.log('BAL: Load failed, try use proxy');
      for (const [u, loc] of url_replace_to) {
        const xhr = new XMLHttpRequest();
        const url = window.location.href.replace(url_www_replace, loc.www);
        xhr.open('HEAD', url);
        xhr.onreadystatechange = function() {
          if (this.readyState === xhr.DONE && this.status === 204) {
            console.log(`BAL: Redirected to ${loc.www}.`);
            window.location = xhr.getResponseHeader('X-Location');
          }
        };
        xhr.send();
      }
    }
  });
})(XMLHttpRequest);
