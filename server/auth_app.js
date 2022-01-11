const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const favicon = require('serve-favicon');
const cors = require("cors");
const http = require('http');
const session = require('express-session');

const router = require('./routes')
const routerAPI = require('./api/routes');
const initSocket = require('./socket');
const { passport } = require('./libs/passport');

// import helpers
const {
  ERR_404,
  ERR_401,
  DATE_TIME,
  SUCCESS_200,
} = require("./helpers/constants");

// import controllers
const globalErrHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const ResError = require("./utils/resError");

function initServer(mongoDB) {
  const app = new express();

  const {
    SESSION_SECRET
  } = process.env;

  // write code middleware do something in HERE...
  global._mongoDB = mongoDB;
  app.locals.mongoDB = mongoDB;

  // for parsing application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

  // for parsing application/json
  app.use(bodyParser.json());

  // for parsing multipart/form-data

  app.set('view engine', 'ejs');

  app.use(express.static("public"));

  app.use('/static', express.static("uploads"));

  app.use(favicon(path.join(_rootPath, 'public', 'favicon.ico')));

  app.use(cors());

  // Config socket.io version 3.0.4
  const server = http.createServer(app);
  const io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket'],
  });
  initSocket(io);
  global._io = io;

  // Config session
  app.use(session({
    secret: SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
  }))

  // Config passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Router
  app.use('/', router);
  app.use('/api/v1', routerAPI);

  app.use("*", (req, res, next) => {
    const err = new ResError(ERR_404.code, `Page ${ERR_404.message}`);
    next(err, req, res, next);
  });

  // fun handle error
  app.use(globalErrHandler);

  return server;
}

module.exports = initServer;
