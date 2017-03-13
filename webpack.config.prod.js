import path from 'path';
import webpack from 'webpack';
import {version} from './package.json';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';

const baseDirectory = __dirname;
const sourcePath = path.resolve(baseDirectory, 'sourceScripts/index');
const vendorPath = path.resolve(baseDirectory, 'sourceScripts/vendor');
const distPath = path.resolve(baseDirectory, 'dist');
const buildBanner = `SIMProv v${version} Production Build`;

export default {
    entry: {
        vendor: vendorPath,
        simprov: sourcePath
    },
    output: {
        path: distPath,
        publicPath: '',
        filename: '[name].[chunkhash].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract('css-loader?sourceMap') //TODO: update ExtractTextPlugin configuration
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.json']
    },
    devtool: 'source-map',
    context: baseDirectory,
    target: 'web',
    externals: {},
    stats: "normal",
    plugins: [
        new webpack.LoaderOptionsPlugin({ //TODO: update LoaderOptionsPlugin configuration in webpack.config.prod
            minimize: true,
            debug: false,
            noInfo: true
        }),
        new webpack.BannerPlugin(buildBanner),
        new ExtractTextPlugin('[name].[contenthash].css'),
        new WebpackMd5Hash(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: '[name].[chunkhash].js'
        }),
        new HtmlWebpackPlugin({
            template: 'sourceScripts/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            inject: true,
        }),
        new UglifyJSPlugin(
            {
                sourceMap: true
            })
    ],
    profile: true
};

