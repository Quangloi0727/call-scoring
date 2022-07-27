// require
require('localenv')
const AppError = require('./src/utils/appError')
global.path = require('path')
const CRUDFlle = require('./src/utils/crud.file')
const models = require('./src/models')

const pathFileConfig = path.normalize(path.join(__dirname, 'config', 'conf.json'))

//  define val
const { PORT } = process.env

global._rootPath = path.dirname(require.main.filename)
global._CRUDFile = new CRUDFlle(pathFileConfig)
global._config = _CRUDFile.readFileSync()

// function log
const logger = require('./src/libs/log').getLogger()
global._logger = logger

global._unit_inc = 1
global._ = require('underscore')
global._moment = require('moment')
global.fs = require('fs')
global._pathFileAdditionField = path.normalize(path.join(_rootPath, 'config', 'additionalField.json'))

global._render = (req, res, view, object) => res.render('pages/index', {
  currUser: req.user,
  page: view,
  ...object,
})

models.sequelize.sync().then(function (connection) {
  _logger.info('connect to MSSQL success!')
}).catch(function (error) {
  _logger.error(`------- error ------- connect to MSSQL fail!`)
  _logger.error(error)
  _logger.error(`------- error ------- connect to MSSQL fail!`)
})

const server = require('./src/libs/express')()

server.listen(PORT, () => {
  _logger.info('info', `Application is running on port ${PORT}`)
})

process.on('unhandledRejection', err => {
  _logger.error('error', 'UNHANDLED REJECTION!!!  shutting down ...')
  _logger.error(err)
  _logger.error('error', new AppError(err).get())
  process.exit(1)
})

process.on('uncaughtException', err => {
  _logger.error('error', 'UNCAUGHT EXCEPTION!!! shutting down...')
  _logger.error(err)
  _logger.error('error', (new AppError(err).get()))
  process.exit(1)
})
