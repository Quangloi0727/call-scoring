const passport = require('passport');
const { Op } = require('sequelize');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const UserModel = require('../models/user');
const UserRoleModel = require('../models/userRole');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findOne({
      where: { id: { [Op.eq]: Number(id) } },
      raw: true,
      nest: true
    });

    const roles = await UserRoleModel.findAll({
      where: { userId: { [Op.eq]: Number(user.id) } },
      attributes: ['role'],
      raw: true,
      nest: true
    });

    return done(null, { ...user, roles: roles });
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
    const user = await UserModel.findOne({
      where: {
        [Op.and]: [{ userName: userName }, { password: password }]
      }
    });
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
      const user = await UserModel.findOne({
        where: {
          [Op.and]: [{ userName: userName }, { password: password }]
        }
      });

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