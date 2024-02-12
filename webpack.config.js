const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

//const isDev = process.env.NODE_ENV === 'development'
//const isProd = !isDev

const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({
            template: './intMap.html',
            filename: 'intMap.html',
            chunks: ['main']
        }),
        new HTMLWebpackPlugin({ 
            template: './index.html',
            filename: 'index.html',
            chunks: ['sphere']
        }),
        new CleanWebpackPlugin(),
    ]

    //if (isProd) {
    //    base.push(new BundleAnalyzerPlugin())
    //}

    return base
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: './global_main.js',
        sphere: './sphere.js'
    },
    output: {
        publicPath: '/',
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: false
    },
    plugins: plugins(),
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
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname),
        },
        port: 8069,
        open: true
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    }
}