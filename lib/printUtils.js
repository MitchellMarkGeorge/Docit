const chalk = require("chalk");
const logSymbols = require("log-symbols");

function success(text) {
  // does this need color
  console.log(logSymbols.success, chalk.bold(text));
}

function error(text) {
  // does this need color
  console.log(logSymbols.error, chalk.bold(text));
  process.exit();
}

function info(text) {
  console.log(logSymbols.info, chalk.bold(text));
}

const printUtils = { success, error, info };

module.exports = printUtils;
