import express from "express";
import path from "path";
import open from "open";
import compression from "compression";
import chalk from "chalk";

/* eslint-disable no-console */

const port = 3000;
const app = express();

app.use(compression());
app.use(express.static('dist'));

// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, '../dist/index.html'));
// });

app.use(express.static(path.resolve(__dirname, '../dist')));

app.listen(port, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log(chalk.green('> Listening on port 3000'));
        console.log(chalk.blue(`> Use http://localhost:${port} in browser`));
        open('http://localhost:' + port);
    }
});
