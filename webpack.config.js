const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
    context: path.resolve(__dirname, ''),
    entry: {
        main: [ './src/download-button.js' ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: '/node_modules/',
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: 'assets',
                    to: 'assets',
                },
                {
                    from: 'manifest.json',
                },
                {
                    from: 'src/author-works-page.css',
                },
            ],
        }),
        new ESLintPlugin({
            exclude: [ 'node_modules', 'dist' ],
            failOnError: true,
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    compress: IS_PRODUCTION,
                    ecma: 6,
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
    },
    devtool: IS_PRODUCTION ? 'hidden-source-map' : 'source-map',
};
