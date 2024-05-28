const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    context: resolve(__dirname, '../../src'),
    module: {
        rules: [
            {
                test: [/\.jsx?$/, /\.js?$/, /\.tsx?$/, /\.ts?$/],
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(scss|sass)$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: ['file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]'],
            },
        ],
    },
    context: resolve(__dirname, '../../src'),
    plugins: [
        new ESLintPlugin({
            extensions: ['js', 'ts', 'jsx', 'tsx'],
        }),
    ],
    performance: {
        hints: false,
    },
};
