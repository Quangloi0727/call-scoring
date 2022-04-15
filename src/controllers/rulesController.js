const { Op, QueryTypes } = require("sequelize");
const pagination = require("pagination");
const moment = require("moment");
const _ = require("lodash");
// const UserModel = require('../models/user');
// const UserRoleModel = require('../models/userRole');
// const TeamModel = require('../models/team');
// const AgentTeamMemberModel = require('../models/agentTeamMember');
const model = require("../models");
const { SUCCESS_200, ERR_500, TYPE_ROLETYPE, USER_ROLE_NOT_ADMIN, OP_TIME_DEFINE  } = require("../helpers/constants");

const titlePage = "Quyền nâng cao";

exports.index = async (req, res, next) => {
  try {
    const rules = await model.Rule.findAll({
      where: {
        // [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
      },
      include: [
        {
          model: model.RuleDetail,
          as: "RuleDetail",
        },
        {
          model: model.RuleType,
          as: "RuleType",
        },
      ],
      // raw: true,
      nest: true,
    });

    return _render(req, res, "rules/index", {
      title: titlePage,
      titlePage: titlePage,
      ruleHasExpires: rules.filter(i => i.RuleType.type == TYPE_ROLETYPE.hasExpires.n),
      ruleOnlyTicks: rules.filter(i => i.RuleType.type == TYPE_ROLETYPE.onlyTick.n),
      TYPE_ROLETYPE,
      USER_ROLE_NOT_ADMIN,
      OP_TIME_DEFINE
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return next(error);
  }
};