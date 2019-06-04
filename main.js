// ==UserScript==
// @name               Bilibili 港澳台
// @namespace          http://kghost.info/
// @version            0.8
// @description:       Remove area restriction
// @description:zh-CN  解除区域限制
// @supportURL         https://github.com/kghost/bilibili-area-limit
// @author             zealot0630
// @include            https://www.bilibili.com/*
// @run-at document-start
// @description Bilibili 港澳台, 解除区域限制
// ==/UserScript==

const url_status = [
  /^https:\/\/bangumi\.bilibili\.com\/view\/web_api\/season\/user\/status\?.*/,
  /^https:\/\/api\.bilibili\.com\/pgc\/view\/web\/season\/user\/status\?.*/,
];
const url_play = /^https:\/\/api\.bilibili\.com\/pgc\/player\/web\/playurl\?.*/;

const url_replace_www = /^https:\/\/www\.bilibili\.com\//;
const url_replace_www_to = {
  'hk': 'https://bilibili-hk-www.kghost.info/',
  'tw': 'https://bilibili-tw-www.kghost.info/',
};

const url_replace = /^https:\/\/api\.bilibili\.com\//;
const url_replace_to = [
  [/僅.*港.*地區/, 'https://bilibili-hk-api.kghost.info/'],
  [/僅.*台.*地區/, 'https://bilibili-tw-api.kghost.info/'],
];

(function (XMLHttpRequest) {
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
      this.log = false;
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
        if (typeof value == 'function') return new Proxy(value, new FunctionHandler(value));
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
      fn.apply(target, argumentsList);
    }
  }

  class EventTargetHandler extends ObjectHandler {
    constructor(target) {
      super(target);
      this.listeners = {};
    }

    getListeners(event) {
      if (!this.listeners.hasOwnProperty(event)) this.listeners[event] = new Map();
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
        console.log("BAL: Return hooked area limit")
        return this.overrideResponseValue;
      } else if (prop === 'responseText' && this.overrideResponse) {
        console.log("BAL: Return hooked area limit")
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
              argumentsList[1] = url.replace(url_replace, to);
              console.log(`BAL: playurl via proxy ${to}.`)
              break;
            }
          }
        } else if ((function () {
            for (const status of url_status) {
              if (url.match(status)) return true;
            }
          })()) {
          realTarget.addEventListener('readystatechange', () => {
            if (realTarget.readyState === 4 && realTarget.status === 200) {
              const status = JSON.parse(realTarget.response);
              if (status && status.result && status.result.area_limit === 1) {
                status.result.area_limit = 0;
                limited = true;
                console.log("BAL: Hook area limit")
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
    XMLHttpRequest, new ClassHandler(XhrHandler)
  );

  window.addEventListener('load', () => {
    if (document.querySelector('div.error-body')) {
      // try load via proxy
      console.log("BAL: Load failed, try use proxy")
      for (const loc in url_replace_www_to) {
        const xhr = new XMLHttpRequest();
        const url = window.location.href.replace(
          url_replace_www, url_replace_www_to[loc]
        );
        xhr.open('HEAD', url);
        xhr.onreadystatechange = function () {
          if (this.readyState === xhr.DONE && this.status === 204) {
            console.log(`BAL: Redirected to ${loc}.`)
            window.location = xhr.getResponseHeader('X-Location');
          }
        };
        xhr.send();
      }
    }
  });
})(XMLHttpRequest);
