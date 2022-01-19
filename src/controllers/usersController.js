const { Op, QueryTypes } = require('sequelize');
const pagination = require('pagination');
const moment = require('moment');
const _ = require('lodash');
const UserModel = require('../models/user');
const model = require('../models');
const {
  SUCCESS_200,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");

const titlePage = 'Danh sách người dùng';

exports.index = async (req, res, next) => {
  try {
    return _render(req, res, 'users/index', {
      title: titlePage,
      titlePage: titlePage,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return next(error);
  }
}

exports.getUsers = async (req, res, next) => {
  try {
    const { page, extension, username, fullname } = req.query;
    const limit = 25;
    const pageNumber = page ? Number(page) : 1;
    const offset = (pageNumber * limit) - limit;
    let query = {};

    if (username) query.userName = { [Op.substring]: username };
    if (fullname) query.fullName = { [Op.substring]: fullname };
    if (extension) query.extension = { [Op.substring]: extension };

    const [recordResult, total] = await Promise.all([
      UserModel.findAll({
        where: {
          ...query,
          [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
        },
        order: [['id', 'DESC']],
        offset: offset,
        limit: limit,
        include: [
          { model: UserModel, as: 'userCreate' },
        ],
        raw: true,
        nest: true
      }),
      UserModel.count({
        where: {
          ...query,
          [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
        },
      })
    ]);

    const userIds = _.map(recordResult, 'id');

    const dataResult = await handleAgentOfTeam(userIds, recordResult);

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: total || 0,
    });

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: dataResult || [],
      paginator: paginator.getPaginationData(),
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return res.status(ERR_500.code).json({ message: error.message });
  }
}

async function handleAgentOfTeam(userIds, users) {
  try {
    let queryString = `
      SELECT 
	      AgentTeamMembers.userId As userId,
	      Teams.id AS teamId,
	      Teams.name AS teamName
      FROM dbo.AgentTeamMembers
      LEFT JOIN dbo.Teams ON AgentTeamMembers.teamId = Teams.id
      WHERE AgentTeamMembers.userId IN ( ${userIds.toString()} )
    `;

    const agentTeamMember = await model.sequelize.query(queryString, { type: QueryTypes.SELECT });

    const dataResult = users.map((user) => {
      const result = agentTeamMember.filter((agentOfTeam) => agentOfTeam.userId == user.id);
      return { ...user, ofTeams: result };
    });

    return dataResult;
  } catch (error) {
    throw new Error(error);
  }
}

exports.createUser = async (req, res, next) => {
  try {
    const data = req.body

    if (data.password !== data.repeat_password) {
      throw new Error('Mật khẩu không trùng khớp!');
    }

    data.fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    data.extension = Number(data.extension);
    data.role = 0;
    data.isActive = 1;
    data.created = req.user.id;
    data.createAt = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');
    data.updatedAt = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');

    await UserModel.create(data);

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    });
  } catch (error) {
    console.log(`------- error ------- getRecording`);
    console.log(error);
    console.log(`------- error ------- getRecording`);

    return res.status(ERR_500.code).json({ message: error.message });
  }
} 