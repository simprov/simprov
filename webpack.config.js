let webpack = require('webpack');
let path = require('path');
const packageInformation = require("./package");
const baseDirectory = __dirname;
const sourcePath = path.resolve(baseDirectory, 'sourceScripts/index');
const outputPath = path.resolve(baseDirectory, 'build');
const contentBase = path.resolve(baseDirectory, 'public');
const buildBanner = `SIMProv v${packageInformation.version}`;

module.exports = {
    mode: "development",
    entry: {
        simprov: sourcePath
    },
    output: {
        path: outputPath,
        filename: '[name].dev.js',
        publicPath: '',
        library: "Simprov",
        libraryTarget: "umd",
        pathinfo: true
    },
    resolve: {
        extensions: ['*', '.js', '.json']
    },
    devtool: 'source-map',
    context: baseDirectory,
    target: 'web',
    stats: "minimal",
    devServer: {
        contentBase: contentBase,
        port: 3000,
        stats: "minimal",
        open: true,
        openPage: '',
        clientLogLevel: "none",
        overlay: {
            warnings: true,
            errors: true
        },
        watchContentBase: true
    },
    plugins: [
        new webpack.BannerPlugin(buildBanner)
    ],
    profile: true
};