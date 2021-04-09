const { merge } = require('webpack-merge');
const CssNano = require('cssnano');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const baseConfig = require('./webpack.base');

/**
 * 代码压缩
 * 文件指纹
 * Tree Shaking（内置，不需要处理）
 * Scope Hosting （内置，不需要处理）
 * 速度优化 （基础包CDN）
 * 体积优化 （代码分割）
 * 公共资源包内容提取
 */
const prodConfig = {
  mode: 'production',
  plugins: [
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: CssNano,
    }),
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://11.url.cn/now/lib/16.2.0/react.min.js',
          global: 'React',
        },
        {
          module: 'react-dom',
          entry: 'https://11.url.cn/now/lib/16.2.0/react-dom.min.js',
          global: 'ReactDom',
        },

      ],
    }),
  ],
  // 公共包的大小文件
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
      },
    },
  },
  devServer: {
    contentBase: './dist',
    hot: true,
    stats: 'error-only',
  },
  devtool: 'cheap-source-map',
};

module.exports = merge(baseConfig, prodConfig);
