const fs = require('fs');
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Downloading the ZIP and double-clicking index.html opens it over file://,
// where every modern browser's CORS policy blocks fetch() of local files —
// runtime `fetch('config.json')` can never work there, regardless of script
// type. This plugin inlines config.json as a global for the built HTML only
// (the raw source at the repo root is untouched and keeps using fetch(), for
// GitHub Pages / npm start / any real HTTP server) and swaps the entry
// script from type="module" to a plain deferred script — the webpack bundle
// has already been compiled down to a classic IIFE with no import/export
// left in it, so the module wrapper serves no purpose in the built output.
class InlineConfigForFileProtocolPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('InlineConfigForFileProtocolPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'InlineConfigForFileProtocolPlugin',
        (data, cb) => {
          const configJson = fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf8');
          const originalTag = '<script type="module" src="js/app.js"></script>';
          if (!data.html.includes(originalTag)) {
            return cb(new Error(
              `InlineConfigForFileProtocolPlugin: expected to find ${originalTag} in the rendered ` +
              'HTML but did not — index.html\'s script tag changed, so config.json would not be inlined ' +
              'and the built app would silently fail to load config over file://.'
            ));
          }
          data.html = data.html.replace(
            originalTag,
            `<script>window.__PM_OPS_CONFIG__=${JSON.stringify(JSON.parse(configJson))};</script>\n<script src="js/app.js" defer></script>`
          );
          cb(null, data);
        }
      );
    });
  }
}

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false,
    }),
    new InlineConfigForFileProtocolPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'config.json', to: 'config.json' },
        { from: 'css', to: 'css' },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'icon.png', to: 'icon.png' },
        { from: 'og-image.png', to: 'og-image.png' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
  ],
});
