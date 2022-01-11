// require
require('localenv');
const AppError = require('./server/utils/appError');
const path = require('path');
const CRUDFlle = require('./server/utils/crud.file');
const userModel = require('./server/models/userModel');
const mssqlConnection = require('./server/libs/mssql');

let pathFileConfig = path.normalize(path.join(__dirname, 'config', 'conf.json'));

//  define val
const {
  USERS_COLLECTION,
  PORT: port,
  ADMIN_USER: userName,
  ADMIN_PASSWORD: password,
} = process.env;

global._rootPath = path.dirname(require.main.filename);
global._CRUDFile = new CRUDFlle(pathFileConfig);
global._config = _CRUDFile.readFileSync();
global._logger = require("./server/config/log")(path.basename(__filename));
global._unit_inc = 1;

process.on('uncaughtException', err => {
  _logger.log('error', 'UNCAUGHT EXCEPTION!!! shutting down...');
  _logger.log('error', (new AppError(err).get()));
  process.exit(1);
});

const { initDB } = require('./server/db/connection');

mssqlConnection();

let connect = initDB();
connect.then(async (mongoDB) => {
  try {
    const query = { userName, password };
    const user = await userModel.getUser(mongoDB, USERS_COLLECTION, query);

    if (!user) {
      await userModel.createUser(mongoDB, USERS_COLLECTION, query);
      console.log('Tao admin thanh cong')
    } else {
      console.log('Admin ton tai');
    }

    return mongoDB;
  } catch (error) {
    console.log(`------- error ------- connect error`);
    console.log(error);
    console.log(`------- error ------- connect error`);
  }
}).then((mongoDB) => {
  const server = require('./server/auth_app')(mongoDB);

  server.listen(port, () => {
    _logger.log('info', `Application is running on port ${port}`);
  });
}).catch((err) => {
  _logger.log('error', new AppError(err).get());
});

process.on('unhandledRejection', err => {
  _logger.log('error', 'UNHANDLED REJECTION!!!  shutting down ...');
  _logger.log('error', new AppError(err).get());
  process.exit(1);
});