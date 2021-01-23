
// ==UserScript==
// @name               Bilibili 港澳台
// @namespace          http://kghost.info/
// @version            1.3.8
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

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./url */ "./src/url.js");


(function (XMLHttpRequest) {
  class ClassHandler {
    constructor(proxy) {
      this.proxy = proxy;
    }

    construct(target, args) {
      const obj = new target(...args);
      return new Proxy(obj, new this.proxy());
    }
  }

  const ProxyGetTarget = Symbol('ProxyGetTarget');
  const ProxyGetHandler = Symbol('ProxyGetHandler');
  class ObjectHandler {
    get(target, prop, receiver) {
      if (target.hasOwnProperty(prop)) {
        return Reflect.get(target, prop, receiver);
      } else if (prop == ProxyGetTarget) {
        return target;
      } else if (prop == ProxyGetHandler) {
        return this;
      } else {
        const value = target[prop];
        if (typeof value == 'function') return new Proxy(value, new NativeFunctionHandler());
        return value;
      }
    }

    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value);
    }
  }

  class FunctionHandler extends ObjectHandler {
    apply(target, thisArg, argumentsList) {
      const realThis = thisArg[ProxyGetTarget];
      if (!realThis) throw new Error('illegal invocations');
      return this.call(target, thisArg, realThis, argumentsList);
    }
  }

  class NativeFunctionHandler extends FunctionHandler {
    call(fn, proxy, realThis, argumentsList) {
      return fn.apply(realThis, argumentsList);
    }
  }

  class EventTargetHandler extends ObjectHandler {
    constructor() {
      super();
      this.listeners = {};
    }

    getListeners(event) {
      if (!this.listeners.hasOwnProperty(event)) this.listeners[event] = new Map();
      return this.listeners[event];
    }

    get(target, prop, receiver) {
      if (prop === 'addEventListener') {
        return new Proxy(target.addEventListener, new this.addEventListener());
      } else if (prop === 'removeEventListener') {
        return new Proxy(target.removeEventListener, new this.removeEventListener());
      } else return super.get(target, prop, receiver);
    }
  }

  EventTargetHandler.prototype.addEventListener = class extends (
    FunctionHandler
  ) {
    call(fn, proxy, realThis, argumentsList) {
      const event = argumentsList[0];
      const listener = argumentsList[1];
      const bridge = listener.bind(proxy);
      argumentsList[1] = bridge;
      proxy[ProxyGetHandler].getListeners(event).set(listener, bridge);
      return fn.apply(realThis, argumentsList);
    }
  };

  EventTargetHandler.prototype.removeEventListener = class extends (
    FunctionHandler
  ) {
    call(fn, proxy, realThis, argumentsList) {
      const event = argumentsList[0];
      const listener = argumentsList[1];
      const cache = proxy[ProxyGetHandler].getListeners(event);
      if (cache.has(listener)) {
        argumentsList[1] = cache.get(listener);
        cache.delete(listener);
      }
      return fn.apply(realThis, argumentsList);
    }
  };

  class XhrHandler extends EventTargetHandler {
    get(target, prop, receiver) {
      if (prop === 'open') {
        return new Proxy(target.open, new this.open());
      } else if (prop === 'send') {
        return new Proxy(target.send, new this.send());
      } else {
        return super.get(target, prop, receiver);
      }
    }
  }

  const showTamperMonkeyUpdate = () => {
    GM.getValue('__area__limit__', 0).then((last) => {
      if (last > new Date().getTime() - 86400000) return;
      if (confirm('Bilibili　港澳台: 无法获取播放文件信息，如果已开通大会员，请升级油猴到BETA版本')) {
        window.open(
          'https://chrome.google.com/webstore/detail/tampermonkey-beta/gcalenpjmijncebpfijmoaglllgpjagf',
          '_blank'
        );
      } else {
        GM.setValue('__area__limit__', new Date().getTime());
      }
    });
  };

  let limited = false;
  XhrHandler.prototype.open = class extends (
    FunctionHandler
  ) {
    call(fn, proxy, realThis, argumentsList) {
      const method = argumentsList[0];
      const url = argumentsList[1];

      if (method === 'GET') {
        if (limited && url.match(_url__WEBPACK_IMPORTED_MODULE_0__["url_play"])) {
          for (const [regs, to] of _url__WEBPACK_IMPORTED_MODULE_0__["url_replace_to"]) {
            function any() {
              for (const reg of regs) {
                if (document.title.match(reg)) return true;
              }
              return false;
            }
            if (any()) {
              argumentsList[1] = url.replace(_url__WEBPACK_IMPORTED_MODULE_0__["url_api_replace"], to.api);
              realThis.hookCookie = true;
              console.log(`BAL: playurl via proxy ${argumentsList[1]}.`);
              break;
            }
          }
        }
      }
      return fn.apply(realThis, argumentsList);
    }
  };

  XhrHandler.prototype.send = class extends (
    FunctionHandler
  ) {
    call(fn, proxy, realThis, argumentsList) {
      if (realThis.hookCookie) {
        GM_cookie.list({ domain: '.bilibili.com', name: 'SESSDATA' }, (cookies, error) => {
          if (error) {
            console.log('BAL: Error fetch cookie, not login');
            realThis.addEventListener('readystatechange', () => {
              if (realThis.readyState === 4 && realThis.status === 200) {
                const status = JSON.parse(realThis.response);
                if (status.code == -10403) showTamperMonkeyUpdate();
              }
            });
            fn.apply(realThis, argumentsList);
          } else {
            console.log(`BAL: Get Cookie ${cookies}`);
            realThis.setRequestHeader('X-Cookie', cookies[0].value);
            fn.apply(realThis, argumentsList);
          }
        });
      } else {
        fn.apply(realThis, argumentsList);
      }
    }
  };

  unsafeWindow.XMLHttpRequest = new Proxy(XMLHttpRequest, new ClassHandler(XhrHandler));

  const ProxyIsProxy = Symbol('ProxyIsProxy');
  class ObjectTreeHandler {
    constructor(target, subtree) {
      this.subtree = subtree;
      for (const key in subtree) {
        if (key in target) this.set(target, key, target[key]);
      }
    }

    get(target, prop, receiver) {
      if (prop == ProxyIsProxy) {
        return true;
      } else {
        return Reflect.get(target, prop, receiver);
      }
    }

    set(target, prop, value, receiver) {
      if (prop in this.subtree) {
        const sub = this.subtree[prop];
        if (typeof sub == 'object') {
          if (!value[ProxyIsProxy]) {
            if (Array.isArray(sub)) {
              return Reflect.set(target, prop, new Proxy(value, new ArrayTreeHandler(value, sub[0])));
            } else {
              return Reflect.set(target, prop, new Proxy(value, new ObjectTreeHandler(value, sub)));
            }
          } else {
            return Reflect.set(target, prop, value);
          }
        } else if (typeof sub == 'function') {
          return Reflect.set(target, prop, sub(value));
        } else {
          return Reflect.set(target, prop, value);
        }
      } else {
        return Reflect.set(target, prop, value);
      }
    }
  }

  class ArrayTreeHandler {
    constructor(target, subtree) {
      this.subtree = subtree;
      for (let [index, value] of target.entries()) {
        if (!value[ProxyIsProxy]) target[index] = new Proxy(value, new ObjectTreeHandler(value, subtree));
      }
    }

    get(target, prop, receiver) {
      if (Array.prototype.hasOwnProperty(prop) && !['length', 'slice', 'constructor', 'forEach'].includes(prop))
        console.log('BAL WARN: ArrayTreeHandler get ' + typeof prop + ':' + prop);
      return Reflect.get(target, prop, receiver);
    }

    set(target, prop, value, receiver) {
      if (!['__proto__'].includes(prop)) console.log('BAL WARN: ArrayTreeHandler set ' + typeof prop + ':' + prop);
      return Reflect.set(target, prop, value);
    }
  }

  const override = {
    __PGC_USERSTATE__: {
      area_limit: function (value) {
        if (value == 1) {
          console.log('BAL: modify area_limit = 0');
          limited = true;
          return 0;
        }
      },
    },
    __INITIAL_STATE__: {
      epInfo: {
        rights: {
          area_limit: function (value) {
            if (value == 1) {
              console.log('BAL: modify epInfo area_limit = 0');
              return 0;
            }
          },
        },
      },
      epList: [
        {
          rights: {
            area_limit: function (value) {
              if (value == 1) {
                console.log('BAL: modify epList area_limit = 0');
                return 0;
              }
            },
          },
        },
      ],
    },
  };

  (() => {
    var userstate = undefined;
    Object.defineProperty(unsafeWindow, '__PGC_USERSTATE__', {
      configurable: true,
      get: () => userstate,
      set: (v) => (userstate = new Proxy(v, new ObjectTreeHandler(v, override.__PGC_USERSTATE__))),
    });

    var state = undefined;
    Object.defineProperty(unsafeWindow, '__INITIAL_STATE__', {
      configurable: true,
      get: () => state,
      set: (v) => (state = new Proxy(v, new ObjectTreeHandler(v, override.__INITIAL_STATE__))),
    });
  })();

  window.addEventListener('load', () => {
    if (document.querySelector('div.error-body')) {
      // try load via proxy
      console.log('BAL: Load failed, try use proxy');
      const vid = /\/(BV[^?#]*)$/gm.exec(window.location.pathname)[1];
      for (const [u, loc] of _url__WEBPACK_IMPORTED_MODULE_0__["url_replace_to"]) {
        const detail = loc.api + 'x/web-interface/view/detail?bvid=' + vid;
        const xhr = new unsafeWindow.XMLHttpRequest();
        xhr.open('GET', detail);
        xhr.hookCookie = true;
        xhr.onreadystatechange = function () {
          if (this.readyState === xhr.DONE && this.status === 200) {
            const r = JSON.parse(this.responseText).data.View.redirect_url;
            console.log(`BAL: Redirected to ${r}.`);
            window.location = r;
          }
        };
        xhr.send();
      }
    }
  });
})(XMLHttpRequest);


/***/ }),

/***/ "./src/url.js":
/*!********************!*\
  !*** ./src/url.js ***!
  \********************/
/*! exports provided: url_status, url_play, url_season, url_api_replace, url_replace_to */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "url_status", function() { return url_status; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "url_play", function() { return url_play; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "url_season", function() { return url_season; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "url_api_replace", function() { return url_api_replace; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "url_replace_to", function() { return url_replace_to; });
const url_status = /^(https:)?\/\/api\.bilibili\.com\/pgc\/view\/web\/season\/user\/status\?.*/;
const url_play = /^(https:)?\/\/api\.bilibili\.com\/pgc\/player\/web\/playurl\?.*/;
const url_season = /^(https:)?\/\/api\.bilibili\.com\/pgc\/view\/web\/season\?.*/;

const url_api_replace = /^(https:)?\/\/api\.bilibili\.com\//;

function build_replace_api(region) {
  return function (str, schema) {
    if (schema) return schema + '//bilibili-' + region + '-api.kghost.info/';
    else return '//bilibili-' + region + '-api.kghost.info/';
  };
}

const url_replace_to = [
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


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map