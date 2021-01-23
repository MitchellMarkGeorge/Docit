const chalk = require("chalk");
const logSymbols = require("log-symbols");

function success(text) {
  
  console.log(logSymbols.success, chalk.bold(text));
}

function error(text) {
  
  console.log(logSymbols.error, chalk.bold(text));
  process.exit();
}

function info(text) {
  console.log(logSymbols.info, chalk.bold(text));
}

const printUtils = { success, error, info };

module.exports = printUtils;
