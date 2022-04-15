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

exports.create = async (req, res) => {
  let transaction;

  try {
    let { expires, expiresType, ruleId, role, unLimited } = req.body;

    transaction = await model.sequelize.transaction();

    if(expires != undefined) expires = Number(expires);
    if(expiresType != undefined) expiresType = Number(expiresType);
    if(ruleId != undefined) ruleId = Number(ruleId);
    if(role != undefined) role = Number(role);
    if(unLimited != undefined) unLimited = unLimited == "true" ? true: false;

    let result = await model.RuleDetail.create(
      { expires, expiresType, ruleId, role, unLimited },
      { transaction: transaction }
    );

    await transaction.commit();

    return res.status(SUCCESS_200.code).json({
      message: "Success!",
      data: result
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    if (transaction) await transaction.rollback();

    return res.status(ERR_500.code).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  let transaction;

  try {
    const { id } = req.params;
    const { expires, expiresType, unLimited } = req.body;

    transaction = await model.sequelize.transaction();

    if (!id) {
      throw new Error("id Không hợp lệ!");
    }

    let dataUpdate = {};

    if (expires) dataUpdate.expires = Number(expires);
    if (expiresType != undefined) dataUpdate.expiresType = Number(expiresType);
    if(unLimited != undefined) dataUpdate.unLimited = unLimited == "true" ? true: false;

    await model.RuleDetail.update(
      dataUpdate,
      { where: { id: Number(id) } },
      { transaction: transaction }
    );

    await transaction.commit();

    return res.status(SUCCESS_200.code).json({
      message: "Success!",
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    if (transaction) await transaction.rollback();

    return res.status(ERR_500.code).json({ message: error.message });
  }
};
