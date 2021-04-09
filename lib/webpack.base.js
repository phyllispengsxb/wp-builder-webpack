const autoprefixer = require('autoprefixer');
const glob = require('glob');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpeedMeasureWebpackplugin = require('speed-measure-webpack-plugin');

const smp = new SpeedMeasureWebpackplugin();

// 多页面打包
const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));

  Object.keys(entryFiles).map((index) => {
    const entryFile = entryFiles[index];

    const match = entryFile.match(/src\(.*)\/index\.js/);
    const pageName = match && match[1];
    entry[pageName] = entryFile;

    return htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        template: `./src/${pageName}/index.html`,
        filename: `${pageName}.html`,
        chunks: [pageName, 'vendors'],
        inject: true,
        minify: {
          html5: true,
          collapseWhitespack: true,
          preserveLineBreaks: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false,
        },
      }),
    );
  });

  return {
    entry,
    htmlWebpackPlugins,
  };
};
const { entry, htmlWebpackPlugins } = setMPA();

module.exports = smp.wrap({
  entry,
  module: {
    /**
         * 资源解析
         * 1. 解析ES6
         * 2. 解析React
         * 3. 解析CSS
         * 4. 解析Less
         * 5. 解析图片
         * 6. 解析字体
         *
         * 样式增强
         * 1. CSS前缀补齐
         * 2. CSS px转换成rem
         */
    rules: [
      {
        test: /.js$/,
        use: [
          'babel-loader',
        ],
      },
      {
        test: /.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => {
                autoprefixer({
                  browsers: ['last 2 version', '> 1%', 'ios 7'],
                });
              },
            },
          },
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75,
              remPrecision: 8,
            },
          },
        ],
      },
      {
        test: /.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]',
            },
          },
        ],
      },
      {
        test: /.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  /**
     * 目录清理
     * 命令行显示优化
     * css提取
     * 错误捕获
     */
  plugins: [
    new CleanWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new MiniCssExtractPlugin({
      fileName: '[name]_[contenthash:8].css',
    }),
    function errorPlugin() {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors
                    && stats.compilation.errors.length
                    && process.argv.indexOf('--watch') === -1
        ) {
          console.log('build error'); // eslint-disable-line
          process.exit(1);
        }
      });
    },
  ].concat(htmlWebpackPlugins),
  stats: 'errors-only',
});
