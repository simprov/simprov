import webpack from "webpack";
import path from "path";
import {version} from "./package";
const baseDirectory = __dirname;
const sourcePath = path.resolve(baseDirectory, 'sourceScripts/index');
const buildBanner = `SIMProv v${version} Development Build`;

export default {
    entry: {
        simprov: sourcePath
    },
    output: {
        path: sourcePath,
        filename: '[name].dev.js',
        publicPath: '',
        library: "Simprov",
        libraryTarget: "umd",
        pathinfo: true
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
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.json']
    },
    devtool: 'inline-source-map',
    context: baseDirectory,
    target: 'web',
    externals: {},
    stats: "minimal",
    plugins: [
        new webpack.LoaderOptionsPlugin({ //TODO: update LoaderOptionsPlugin configuration in webpack.config.dev
            minimize: true,
            debug: false,
            noInfo: false
        }),
        new webpack.BannerPlugin(buildBanner),
        // new HtmlWebpackPlugin({
        //     template: 'public/index.html',
        //     inject: true
        // })
    ],
    profile: true
}
