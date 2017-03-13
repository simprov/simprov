import chalk from 'chalk';
import readPkg from 'read-pkg';
import path from 'path';

/* eslint-disable no-console */

const baseDirectory = __dirname;
const pkgPath = path.resolve(baseDirectory, '../');

readPkg(pkgPath).then(packageInfo => {
    const terminalStatement = `${chalk.yellow('SIMProv')} ${chalk.blue('v' + packageInfo.version)} ${chalk.green('Development Mode Initiated')}`;
    console.log(terminalStatement);
}).catch(function (error) {
    console.log(error);
});






