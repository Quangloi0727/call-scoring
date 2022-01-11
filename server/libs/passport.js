const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;

const ObjectID = require('mongodb').ObjectID;

const userModal = require('../models/userModel');

const { USERS_COLLECTION } = process.env;

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModal.getUser(_mongoDB, USERS_COLLECTION, { _id: ObjectID(id) });
    return done(null, user);
  } catch (error) {
    console.log(`------- error ------- deserializeUser`);
    console.log(error);
    console.log(`------- error ------- deserializeUser`);
    return done(error);
  }
});

passport.use('local-login', new LocalStrategy({
  usernameField: 'userName',
  passwordField: 'password',
}, async (userName, password, done) => {
  try {
    const user = await userModal.getUser(_mongoDB, USERS_COLLECTION, { userName, password })
    if (!user) {
      const error = new Error();
      error.message = "Tài khoản hoặc mật khẩu không đúng!"
      error.statusCode = 401;
      throw error;
    }
    return done(null, user);
  } catch (error) {
    console.log(`begin ------- error ------- local-login LocalStrategy`);
    console.log(error);
    console.log(`end ------- error ------- local-login LocalStrategy`);
    done(error);
  }
}));

passport.use(new BasicStrategy(
  async function (userName, password, done) {
    try {
      const user = await userModal.getUser(_mongoDB, USERS_COLLECTION, { userName, password })
      if (!user) {
        const error = new Error();
        error.message = "Tài khoản hoặc mật khẩu không đúng!"
        error.statusCode = 401;
        error.status = 'api';
        throw error;
      }
      return done(null, user);
    } catch (error) {
      console.log(`------- error ------- `);
      console.log(error);
      console.log(`------- error ------- `);
      done(error);
    }
  }
));

exports.passport = passport;

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}