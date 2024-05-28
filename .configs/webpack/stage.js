const {merge} = require("webpack-merge");
const {resolve} = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin");
const dotenv = require("dotenv");
const path = require("path");
const webpack = require("webpack");
const commonConfig = require("./common");

module.exports = (env) => {
    dotenv.config({
        path: path.resolve(`.env.${env.NODE_ENV}`)
    });

    return merge(commonConfig, {
        mode: "production",
        entry: "./index.ts",
        output: {
            filename: "js/bundle.[contenthash].min.js",
            path: resolve(__dirname, "../../dist"),
            publicPath: "./",
        },
        devtool: "source-map",
        plugins: [
            new HtmlWebpackPlugin({
                template: "index.html.ejs",
                publicPath: './',
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: './../public',
                    }
                ]
            }),
            new webpack.DefinePlugin({
                "process.env": JSON.stringify(process.env),
            }),
        ],
    })
};
