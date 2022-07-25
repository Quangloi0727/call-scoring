// require
require('localenv')
const AppError = require('./src/utils/appError')
const path = require('path')
const CRUDFlle = require('./src/utils/crud.file')
const models = require('./src/models')
const fs = require('fs')
const fsPromises = fs.promises
let files = ''
let pathFileConfig = path.normalize(path.join(__dirname, 'config', 'conf.json'))
async function asyncGetLogo() {
  try {
    const result = await fsPromises.readdir('public/dist/img/logo')
    if (result.length > 0) {
      files = result[0]
    }
  } catch (error) {
    console.log('Lấy tên logo bị lỗi', error)
  }
}

asyncGetLogo()
//  define val
const { PORT } = process.env

global._rootPath = path.dirname(require.main.filename)
global._CRUDFile = new CRUDFlle(pathFileConfig)
global._config = _CRUDFile.readFileSync()
global._logger = require("./src/libs/log")(path.basename(__filename))
global._unit_inc = 1

global._render = (req, res, view, object) => res.render('pages/index', {
  currUser: req.user,
  fileLogo: files,
  page: view,
  ...object,
})

process.on('uncaughtException', err => {
  _logger.log('error', 'UNCAUGHT EXCEPTION!!! shutting down...')
  _logger.log('error', (new AppError(err).get()))
  process.exit(1)
})

models.sequelize.sync().then(function (connection) {
  console.log('connect to MSSQL success!')
}).catch(function (error) {
  console.log(`------- error ------- connect to MSSQL fail!`)
  console.log(error)
  console.log(`------- error ------- connect to MSSQL fail!`)
})

const server = require('./src/libs/express')()

server.listen(PORT, () => {
  _logger.log('info', `Application is running on port ${PORT}`)
})

process.on('unhandledRejection', err => {
  _logger.log('error', 'UNHANDLED REJECTION!!!  shutting down ...')
  _logger.log('error', new AppError(err).get())
  process.exit(1)
})
