const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        //imports: './scripts/imports.js',
        main: './global_main.js',
        //features: './scripts/drawFeatures.js',
        //images: './scripts/satimages.js',
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: './intMap.html',
            filename: 'intMap.html'
        }),
        new CleanWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /.(png|jpg|svg|gif)$/,
                type: 'asset/resource'
            }
        ]
    }
}