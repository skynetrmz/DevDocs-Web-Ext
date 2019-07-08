import path from 'path'
import childProcess from 'child_process'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin'
import packageJson from './package.json'

const config: webpack.Configuration = {
  mode: process.env.NODE_ENV as undefined || 'development',
  stats: 'minimal',
  entry: {
    'devdocs-style': './src/popup/devdocs.sass',
    'devdocs-dark-style': './src/popup/devdocs-dark.sass',
    'popup-style': './src/popup/popup.sass',
    'popup-js': './src/popup/index.tsx',

    'background-js': './src/background/index.ts',

    'options-js': './src/options/index.tsx',
    'options-style': './src/options/options.sass'
  },
  output: {
    path: path.resolve('./extension/dist')
  },
  module: {
    rules: [{
      test: /\.(png|jpg|gif|ttf|eot|woff|woff2)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192
        }
      }]
    }, {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'cache-loader'
      }, {
        loader: 'thread-loader'
      }, {
        loader: 'ts-loader',
        options: {
          happyPackMode: true
        }
      }]
    }, {
      test: path.resolve(__dirname, 'vendor/devdocs/assets/javascripts/app/searcher.coffee'),
      use: [{
        loader: 'cache-loader'
      }, {
        loader: 'thread-loader'
      }, {
        loader: 'exports-loader',
        options: {
          'app.Searcher': true
        }
      }, {
        loader: 'imports-loader',
        options: {
          app: `>{config: {max_results: 50}}`,
          $: 'jquery',
          Events: '../lib/events.coffee',
          util: '../lib/util.coffee'
        }
      }, {
        loader: 'coffee-loader'
      }]
    }, {
      test: path.resolve(__dirname, 'vendor/devdocs/assets/javascripts/models/entry.coffee'),
      use: [{
        loader: 'cache-loader'
      }, {
        loader: 'thread-loader'
      }, {
        loader: 'exports-loader',
        options: {
          'app.models.Entry': true
        }
      }, {
        loader: 'imports-loader',
        options: {
          app: `>{models: {}, Model: function (o) {for(k in o) {this[k] = o[k]}}}`,
          'app.Searcher': '../app/searcher.coffee'
        }
      }, {
        loader: 'coffee-loader'
      }]
    }, {
      test: path.resolve(__dirname, 'vendor/devdocs/assets/javascripts/lib/events.coffee'),
      use: [{
        loader: 'cache-loader'
      }, {
        loader: 'thread-loader'
      }, {
        loader: 'exports-loader',
        options: {
          'this.Events': true
        }
      }, {
        loader: 'coffee-loader'
      }]
    }, {
      test: path.resolve(__dirname, 'vendor/devdocs/assets/javascripts/lib/util.coffee'),
      use: [{
        loader: 'cache-loader'
      }, {
        loader: 'thread-loader'
      }, {
        loader: 'imports-loader',
        options: {
          $: 'jquery'
        }
      }, {
        loader: 'coffee-loader'
      }]
    }, {
      test: /\.(css)$/,
      use: [{
        loader: MiniCssExtractPlugin.loader
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true
        }
      }]
    }, {
      test: /\.(scss|sass)$/,
      use: [{
        loader: MiniCssExtractPlugin.loader
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true
        }
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          includePaths: [
            'node_modules',
            path.parse(require.resolve('compass-mixins')).dir,
            path.resolve(__dirname, 'vendor/devdocs/assets/stylesheets/')
          ]
        }
      }]
    }, {
      test: /\.(pug)$/,
      use: [{
        loader: 'cache-loader'
      }, {
        loader: 'thread-loader'
      }, {
        loader: 'pug-loader'
      }]
    }]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'inline-cheap-source-map',
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new LodashModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'src/popup/popup.pug',
      inject: false,
      chunks: ['devdocs-style', 'devdocs-dark-style', 'popup-style', 'vendors', 'popup-js']
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: 'src/options/options.pug',
      chunks: ['options-style', 'vendors', 'options-js']
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new webpack.DefinePlugin({
      BUILD_MODE: JSON.stringify(process.env.BUILD_MODE || ''),
      VERSION: JSON.stringify(packageJson.version),
      GIT_VERSION: JSON.stringify(`${childProcess.execSync('git rev-parse HEAD')}`.slice(0, 6))
    }),
    new webpack.ProgressPlugin()
  ]
}

export default config
