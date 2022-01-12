// require
require('localenv');
const AppError = require('./server/utils/appError');
const path = require('path');
const CRUDFlle = require('./server/utils/crud.file');
const mssqlConnection = require('./server/libs/mssql');

let pathFileConfig = path.normalize(path.join(__dirname, 'config', 'conf.json'));

//  define val
const { PORT } = process.env;

global._rootPath = path.dirname(require.main.filename);
global._CRUDFile = new CRUDFlle(pathFileConfig);
global._config = _CRUDFile.readFileSync();
global._logger = require("./server/libs/log")(path.basename(__filename));
global._unit_inc = 1;

process.on('uncaughtException', err => {
  _logger.log('error', 'UNCAUGHT EXCEPTION!!! shutting down...');
  _logger.log('error', (new AppError(err).get()));
  process.exit(1);
});

mssqlConnection();

const server = require('./server/libs/express')();

server.listen(PORT, () => {
  _logger.log('info', `Application is running on port ${PORT}`);
});

process.on('unhandledRejection', err => {
  _logger.log('error', 'UNHANDLED REJECTION!!!  shutting down ...');
  _logger.log('error', new AppError(err).get());
  process.exit(1);
});