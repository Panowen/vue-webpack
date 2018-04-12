const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ROOT = path.join(__dirname, '../');
const IS_DEV = process.env.NODE_ENV === 'development';

const entrys = {};
const plugins = [];

const generatePlugin = (name) => {
  let destName = `${name}.html`;
  if (name === 'app') {
    destName = 'index.html';
  }
  if (IS_DEV) {
    return new HtmlWebpackPlugin({
      filename: destName,
      template: `src/${name}/index.html`,
      inject: true,
      chunks: [name],
    });
  } else {
    return new HtmlWebpackPlugin({
      filename: path.join(ROOT, 'dist', destName),
      template: `src/${name}/index.html`,
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      },
      chunks: ['manifest', 'vendor', name],
      chunksSortMode: 'dependency',
    })
  }
};

const entrysPath = path.join(ROOT, 'src');
const dirs = fs.readdirSync(entrysPath);
dirs.forEach((name) => {
  //  设置入口文件 entry.js
  if (fs.existsSync(path.join(entrysPath, name, 'entry.js'))) {
    entrys[name] = ['babel-polyfill', `./src/${name}/entry.js`];
  } else {
    throw new Error(`entry.js for ${name} does not exist.`);
  }
  // 设置 html
  if (fs.existsSync(path.join(entrysPath, name, 'index.html'))) {
    plugins.push(generatePlugin(name));
  } else {
    throw new Error(`index.html for ${name} does not exist.`);
  }
});
exports.entrys = entrys;
exports.plugins = plugins;
