const {merge} = require("webpack-merge");
const {resolve} = require("path");
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
            filename: "index.js",
            path: resolve(__dirname, "../../dist"),
            publicPath: "./",
        },
        devtool: "source-map",
        plugins: [
            new webpack.DefinePlugin({
                "process.env": JSON.stringify(process.env),
            }),
        ],
    })
};
