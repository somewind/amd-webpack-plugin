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
