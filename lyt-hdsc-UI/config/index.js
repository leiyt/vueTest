'use strict'
// Template version: 1.2.0
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      // '/scp-': {
      //   target: 'http://192.168.0.242:30940/', // 开发机
      //   // target: 'http://172.16.10.116:8083', 
      //   changeOrigin: true
      // },
      '/scp-eventapp': {
        // target: 'http://172.16.10.63:9065',   
        target: 'http://192.168.0.242:30081/', // 测试环境
        // target: 'http://192.168.0.161:30940', // (线上242用户管理)
        changeOrigin: true
      },
      '/scp-informationreleaseapp': {
        target: 'http://172.16.10.91:8082',
        // target: 'http://192.168.0.242:30081/',
        changeOrigin: true
      },
      '/scp-laddercontrolapp': {
        // target: 'http://172.16.10.41:8082',
        target: 'http://172.16.10.37:8082',
        // target: 'http://192.168.0.242:30081/',    // 测试环境
        changeOrigin: true
      },
      '/mapapp': {
        target: 'http://192.168.0.242:39035/', // (地图应用) wagger: http://192.168.0.236:9036/
        changeOrigin: true
      },
      // '/scp-mdmcomponent': {
      //   target: 'http://172.16.10.33:8182/', // （主数据管理-人员管理）
      //   changeOrigin: true
      // },
      '/scp-mdmapp': {
        // target: 'http://192.168.0.242:30940/',
        // target: 'http://192.168.0.161:30940/',
        target: 'http://172.16.10.77:8182/', // (主数据管理：房屋管理、组织管理)
        changeOrigin: true
      },
      '/scp-broadcastapp': {
        target: 'http://192.168.0.242:30940/', // (个性化广播)
        // target: 'http://172.16.10.28:8082/',
        // target: 'http://192.168.0.161:30940/', //
        changeOrigin: true
      },
      '/zuul/scp-broadcastapp': {
        target: 'http://192.168.0.242:30940/', // 音频上传 蔡洽渠(个性化广播)
        // target: 'http://192.168.0.161:30940/',
        // target: 'http://172.16.10.28:8082/',
        changeOrigin: true
      },
      '/scp-parkinglotapp': {
        target: 'http://localhost:8082/',
        changeOrigin: true
      },
      '/scp-cardmgmtapp': {
        target: 'http://localhost:8082/' // tlb
      },
      '/scp-videogatewayapp': {
        target: 'http://192.168.0.242:30081/', // 视频应用
        changeOrigin: true
      },
      '/scp-videointercomapp': {
        target: 'http://192.168.0.161:39021/',
        changeOrigin: true,
        pathRewrite: {}
      }
    },
    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.HOST, if port is in use, a free one will be determined
    autoOpenBrowser: true,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warings will be shown in the console.
    useEslint: true,
    // If true, eslint errors and warings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',

    /**
     * SourceMap
     */
    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
