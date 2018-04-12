require('./check-versions');

const config = require('../config');

const express = require('express');
const webpack = require('webpack');
const proxyMiddleware = require('http-proxy-middleware');

const webpackConfig = process.env.NODE_ENV === 'testing'
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf');
const port = process.env.PORT || config.dev.port;

const proxyTable = config.dev.proxyTable;

const app = express();
const compiler = webpack(webpackConfig);

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true,
});

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {
  },
});
compiler.plugin('compilation', (compilation) => {
  compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
    hotMiddleware.publish({ action: 'reload' });
    cb();
  });
});
Object.keys(proxyTable).forEach((context) => {
  let options = proxyTable[context];
  if (typeof options === 'string') {
    options = { target: options };
  }
  app.use(proxyMiddleware(options.filter || context, options))
})
app.use(require('connect-history-api-fallback')());

// serve webpack bundle output
app.use(devMiddleware);

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware);

// serve pure static assets
app.use(config.dev.assetsPublicPath, express.static('./static'));

const uri = `http://localhost:${port}`;

devMiddleware.waitUntilValid(() => {
  console.log(`> Listening at ${uri}\n`);
});

module.exports = app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
});
