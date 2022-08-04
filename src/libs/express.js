
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const favicon = require('serve-favicon')
const cors = require("cors")
const http = require('http')
const session = require('express-session')

const router = require('../routes')
const initSocket = require('../socket')
const { passport } = require('./passport')
const { ERR_404 } = require("../helpers/constants")
const globalErrHandler = require("../controllers/errorController")
const ResError = require("../utils/resError")
const multer = require('multer')
const forms = multer()

function initServer() {
  const app = new express()

  const {
    SESSION_SECRET
  } = process.env

  // for parsing application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

  // for parsing application/json
  app.use(bodyParser.json())

  // for parsing multipart/form-data
  // app.use(forms.array())

  app.set('view engine', 'ejs')

  app.use(express.static("public"))

  app.use('/export', express.static(path.join(_rootPath, 'public', 'export')))

  app.use('/public', express.static(path.join(_rootPath, 'public', 'files')))

  app.use('/static', express.static("uploads"))

  app.use(favicon(path.join(_rootPath, 'public', 'favicon.ico')))

  app.use(cors())

  _.mixin(_.extend(require('underscore.string').exports(), require(path.join(_rootPath, 'src', 'libs', 'function'))))

  // Config socket.io version 3.0.4
  const server = http.createServer(app)
  const io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket'],
  })
  initSocket(io)
  global._io = io

  // Config session
  app.use(session({
    secret: SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
  }))

  // Config passport
  app.use(passport.initialize())
  app.use(passport.session())

  // Router
  app.use('/', router)

  app.use("*", (req, res, next) => {
    if (req.originalUrl.indexOf("style.css") >= 0 || req.originalUrl.indexOf("script.js") >= 0) return next(null, req, res, next)
    const err = new ResError(ERR_404.code, `Page ${ERR_404.message}`)
    next(err, req, res, next)
  })

  // fun handle error
  app.use(globalErrHandler)

  return server
}

module.exports = initServer
