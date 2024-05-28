// development config
const {merge} = require("webpack-merge");
const commonConfig = require("./common");
const dotenv = require("dotenv");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
  dotenv.config({
    path: path.resolve(`.env.${env.NODE_ENV}`)
  });

  return merge(commonConfig, {
    mode: "development",
    entry: [
      "webpack-dev-server/client?http://localhost:8080",
      "./index.ts",
    ],
    devServer: {
      static: './public/',
      hot: true,
      historyApiFallback: true,
    },
    devtool: "cheap-module-source-map",
    plugins: [
      new HtmlWebpackPlugin({ template: "index.html.ejs" }),
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env),
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
  });
}

