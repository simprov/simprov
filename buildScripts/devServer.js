import express from "express";
import path from "path";
import webpackDevMiddleware from "webpack-dev-middleware";
import open from "open";
import webpack from "webpack";
import chalk from "chalk";
import config from "../webpack.config.dev";

/* eslint-disable no-console */

const port = 3000;
const app = express();
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
    noInfo: false,
    quiet: false,
    publicPath: config.output.publicPath,
    stats: "minimal"
}));

app.use(express.static(path.resolve(__dirname, '../public')));

app.listen(port, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log(chalk.green('> Listening on port 3000'));
        console.log(chalk.blue(`> Use http://localhost:${port} in browser`));
        open('http://localhost:' + port);
    }
});
