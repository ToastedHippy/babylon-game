const path = require('path');
const HtmlTemplatePlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'ts-loader'
                ],
                exclude: /node_modules/
            },
        ]
    },
    resolve: {
        extensions: [
            '.ts',
            '.js'
        ]
    },
    plugins: [
        new HtmlTemplatePlugin({
            template: "./src/index.html"
        }),
        new CleanWebpackPlugin(),
        // new BundleAnalyzerPlugin(),
        new CopyPlugin([
            {from: 'src/assets', to: 'assets'},
            {from: 'src/styles', to: 'styles'},
        ])
    ]

};
