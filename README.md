# AMD webpack plugin

## Features

This plugin is used to enhance the AMD packaging mode of webpack:

1. Make `SplitChunks` to be AMD modules.
2. Inject `SplitChunks` AMD module names to entry chunk dependencies automatically.
3. Make webpack replace the `root external(global variable)` correctly.
4. The Dynamic Import capability of webpack will be preserved

## Installation

```shell
npm i amd-webpack-plugin --save-dev
```

or

```shell
yarn add amd-webpack-plugin --dev
```

## Usage

`webpack.config.js`

```js
const path = require('path')
const AmdWebpackPlugin = require('amd-webpack-plugin')

// webpack config
module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    'entry1': path.join(__dirname, 'src/entry1.js'),
    'entry2': path.join(__dirname, 'src/entry2.js')
  },
  module: {
    rules: [
      {
        test: /\.jsx?|tsx?$/,
        loader: ['babel-loader']
      }
    ]
  },
  externals: {
    // this will be replaced as global variable
    'jquery': { root: '$' },
    // this will be replaced as AMD dependency
    'three': 'three',
    'd3': { amd: 'd3' }
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'amd'
  },
  plugins: [
    new AmdWebpackPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // choose other node_modules to be vendor.js
        vendor: {
          name: 'vendor',
          chunks: 'all',
          minChunks: 1,
          test: /[\\/]node_modules[\\/]/,
          priority: 10
        }
      }
    }
  }
}
```

`src/entry1.js`

```js
import jquery from 'jquery'
import three from 'three'
import lodash from 'lodash'
```

`src/entry2.js`

```js
import jquery from 'jquery'
import d3 from 'd3'
import lodash from 'lodash'

// Dynamic Import will use Webpack Module Engine
// this chunk will not convert to AMD Module
import(
  /* webpackChunkName: "asyc-import-data" */
  './data'
).then(data => {
  console.log(data)
});
```

`dist/async-import-data`

```js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["asyc-import-data"],{
  ...
}]);
```

`dist/entry1.js`

```js
define(["three","vendor"], function(__WEBPACK_EXTERNAL_MODULE_three__) {
  ...
})
```

`dist/entry2.js`

```js
define(["d3","vendor"], function(__WEBPACK_EXTERNAL_MODULE_d3__) {
  ...
})
```

`dist/vendor.js`

```js
 define(function() { return (window["webpackJsonp"] = window["webpackJsonp"] || []).push([["vendor"],{
   ...
 }])})

```

You can get the full [demo](./demo)

## License

[MIT](./LICENSE)
