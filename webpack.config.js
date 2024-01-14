/* eslint-disable */
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist', process.env.NODE_ENV),
    filename: '[name].[contenthash].js',
    asyncChunks: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'thermo',
      filename: 'index.html',
      template: 'src/index.html'
    }),
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      APP_ENV: 'production',
      BUILT_AT: new Date().toString(),
      DEBUG: false,
      API_ENDPOINT: ''
    }),
    new ESLintPlugin({ extensions: ['ts', 'tsx', 'json', 'css'] }),
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, 'assets'), to: 'assets' }]
    })
  ],
  devServer: {
    static: { directory: path.join(__dirname, 'dist') },
    hot: true,
    port: process.env.PORT || 4000,
    host: '127.0.0.1'
  },
  mode:
    process.env.NODE_ENV === 'test'
      ? 'development'
      : process.env.NODE_ENV
        ? process.env.NODE_ENV
        : 'production',
  module: {
    rules: [
      {
        type: 'javascript/auto',
        test: /\.(sa|sc|c)ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css']
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name(module, chunks, cacheGroupKey) {
            const moduleFileName = module
              .identifier()
              .split('/')
              .reduceRight((item) => item)
            const allChunksNames = chunks.map((item) => item.name).join('~')
            return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`
          }
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    minimize: true,
    minimizer: [
      `...`,
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        terserOptions: {
          sourceMap:
            process.env.NODE_ENV === 'development' ? { url: 'inline' } : false,
          compress: true
        }
      }),
      new CssMinimizerPlugin()
    ]
  }
}

module.exports = config
