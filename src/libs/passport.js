const _ = require('lodash');
const passport = require('passport');
const { Op } = require('sequelize');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const UserModel = require('../models/user');
const UserRoleModel = require('../models/userRole');
const RuleDetailModel = require('../models/ruleDetail');
const RuleModel = require('../models/rule');

const { USER_ROLE, SYSTEM_RULE, OP_TIME_DEFINE } = require('../helpers/constants');

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
    let rules = {};
    // 
    if(roles.find(i => i.role == USER_ROLE.admin.n)){
      rules = SYSTEM_RULE; // full quyền
    }else {
      
      /**
       * todo:
       * - tìm trong bảng ruleDetail xem với role này user có quyền gì
       */
      
      let ruleFounds = await RuleDetailModel.findAll({
        where: { role: { [Op.in]: roles.map(i => i.role) } },
        attributes: ['role', 'expires', 'expiresType', 'unLimited'],
        include: [
          { model: RuleModel, as: 'Rule' },
        ],
        // raw: true,
        nest: true
      });

      /**
       * Nguyễn Như Hưng (BA) confirm:
       *  + Quyền xem dữ liệu: lấy theo rule có expires lớn nhất
       *  + Quyền xuất excel: có ít nhất 1 quyền là có quyền xuất
       */
      let expires;

      for (let i = 0; i < ruleFounds.length; i++) {
        const element = ruleFounds[i];
        if(element.Rule){

          if(element.Rule.code == SYSTEM_RULE.XEM_DU_LIEU.code){
            if(element.unLimited == true) expires = 30000; // chắc < năm 1945
            else {
              // nếu ko limited thì sẽ phải tính theo exprires và expiresType
              let expiresTypeFound = getDefined(OP_TIME_DEFINE, element.expiresType);
              element.expires = expiresTypeFound.day * element.expires;
            }
            expires = _.max([expires, element.expires]);
            rules[SYSTEM_RULE.XEM_DU_LIEU.code] = {
              ...SYSTEM_RULE.XEM_DU_LIEU,
              expires
            };
          }
          if(element.unLimited == true && element.Rule.code == SYSTEM_RULE.XUAT_EXCEL.code){

            rules[SYSTEM_RULE.XUAT_EXCEL.code] = SYSTEM_RULE.XUAT_EXCEL;
            // break;
          }

        }

      }
      // rules = {};
    }

    console.log(`deserializeUser user.name: ${user.userName}`, roles, {rules});
    return done(null, { ...user, roles, rules });
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
      error.status = 'api';
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

exports.isAdmin = (req, res, next) => {
  let { user } = req;
  if (user.roles.find(i => i.role == USER_ROLE.admin.n)) {
    return next();
  }
  return next(new Error('Không có quyền truy cập'));
}
function getDefined (defined, value) {
  let { df, ...allData } = defined; // do có 1 key "df", cần xóa key này đi trước khi find data;
  let dfFound =  Object.keys(allData).find((i, index) => {
    const ele = allData[i];

    if(ele.n == value) return true;
    else return false;
  });

  return allData[dfFound] || {
    n: null,
    t: "Not Found!",
    c: "danger"
  };
};