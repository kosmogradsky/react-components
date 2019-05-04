const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const styledComponentsTransformer = createStyledComponentsTransformer({
  getDisplayName: (filename, bindingName) => filename.match(/([^\/]+)(?=\.\w+$)/)[0] + "__" + bindingName
});

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        options: {
          errorsAsWarnings: true,
          getCustomTransformers: () => ({ before: [styledComponentsTransformer] })
        }
      }
    ]
  }
});