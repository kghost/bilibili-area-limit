const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const UserScript = `
// ==UserScript==
// @name               Bilibili 港澳台
// @namespace          http://kghost.info/
// @version            1.3.9
// @description        解除区域限制 (修正大会员限制，添加国际友人看国内功能)
// @supportURL         https://github.com/kghost/bilibili-area-limit
// @author             zealot0630
// @include            https://*.bilibili.com/*
// @run-at document-start
// @grant       GM_notification
// @grant       GM_cookie
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==
`;

module.exports = {
  entry: './src/main.js',
  devtool: 'source-map',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: UserScript,
      raw: true,
    }),
  ],
};
