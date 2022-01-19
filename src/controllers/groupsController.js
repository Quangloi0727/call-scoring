const { Op, QueryTypes } = require('sequelize');
const pagination = require('pagination');
const moment = require('moment');
const _ = require('lodash');
const UserModel = require('../models/user');
const TeamModel = require('../models/team');
const AgentTeamMemberModel = require('../models/agentTeamMember');
const model = require('../models');
const {
  SUCCESS_200,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");

const titlePage = 'Danh sách nhóm';

exports.index = async (req, res, next) => {
  try {
    const users = await UserModel.findAll({
      where: {
        [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
      },
    });

    return _render(req, res, 'groups/index', {
      title: titlePage,
      titlePage: titlePage,
      users: users,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return next(error);
  }
}

exports.getGroups = async (req, res, next) => {
  try {
    const { page, name } = req.query;
    const limit = 10;
    const pageNumber = page ? Number(page) : 1;
    const offset = (pageNumber * limit) - limit;
    let query = {};

    const [groupsResult, total] = await Promise.all([
      TeamModel.findAll({
        where: {
          ...query,
        },
        order: [['id', 'DESC']],
        offset: offset,
        limit: limit,
        include: [{ model: UserModel, as: 'userCreate' }],
        raw: true,
        nest: true
      }),
      TeamModel.count({
        where: {
          ...query,
        },
      })
    ]);

    const teamIds = _.map(groupsResult, 'id');

    const dataResult = await handleTeam(teamIds, groupsResult);

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

async function handleTeam(teamIds, teams) {
  try {
    let queryString = `
      SELECT 
        AgentTeamMembers.teamId AS teamId,
        AgentTeamMembers.leader AS leader,
        Users.id As userId,
        Users.userName AS userName,
        Users.fullName AS fullName
      FROM dbo.AgentTeamMembers
      LEFT JOIN dbo.Users ON AgentTeamMembers.userId = Users.id
      WHERE AgentTeamMembers.teamId IN ( ${teamIds.toString()} )
    `;

    const agentTeamMember = await model.sequelize.query(queryString, { type: QueryTypes.SELECT });

    const dataResult = teams.map((team) => {
      const result = agentTeamMember.filter((agentOfTeam) => agentOfTeam.teamId == team.id);
      return { ...team, member: result };
    });

    return dataResult;
  } catch (error) {
    throw new Error(error);
  }
}

exports.createGroup = async (req, res) => {
  try {
    const data = req.body;

    data.created = req.user.id;

    if (!data.name || data.name.trim() == '') {
      throw new Error('Tên nhóm không được để trống!');
    }

    if (!data.leader || data.leader.length <= 0) {
      throw new Error('Giát sát nhóm không được để trống!');
    }

    const teamCreateResult = await TeamModel.create(data);

    let dataMember = data.leader.map(el => {
      return {
        teamId: teamCreateResult.id,
        userId: el,
        leader: 1
      }
    });

    await AgentTeamMemberModel.bulkCreate(dataMember);

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

exports.detail = async (req, res) => {
  try {
    const { id } = req.params;

    const [users, memberOfTeam, team] = await Promise.all([
      UserModel.findAll({
        where: {
          [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
        },
        raw: true,
        nest: true,
      }),
      AgentTeamMemberModel.findAll({
        where: {
          teamId: Number(id),
        },
        raw: true,
        nest: true
      }),
      TeamModel.findOne({
        where: { id: { [Op.eq]: Number(id) } },
        include: [{ model: UserModel, as: 'userCreate' }],
        raw: true,
        nest: true
      })
    ]);

    let userHandel = users.map((user) => {
      let found = memberOfTeam.find(item => item.userId == user.id && item.leader == 1);

      return { ...user, leader: found ? 1 : 0 }
    });

    team.createdAt = moment(team.createdAt).format('HH:mm:ss DD/MM/YYYY');
    team.updatedAt = moment(team.updatedAt).format('HH:mm:ss DD/MM/YYYY');

    return _render(req, res, 'groups/detail', {
      titlePage: null,
      team: team,
      users: userHandel,
      memberNumber: memberOfTeam && memberOfTeam.length || 0,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return next(error);
  }
}

exports.update = async (req, res) => {
  try {
    const { description, name, id, leader } = req.body;

    if (!name || name.trim() == '') {
      throw new Error('Tên nhóm không được để trống!');
    }

    if (!leader || leader.length <= 0) {
      throw new Error('Giát sát nhóm không được để trống!');
    }

    let dataUpdate = {};

    if (name) dataUpdate.name = name;
    if (description) dataUpdate.description = description;

    await TeamModel.update(
      dataUpdate,
      { where: { id: Number(id) } },
    );

    await AgentTeamMemberModel.destroy({ where: { teamId: Number(id), leader: 1 } });

    let dataMember = leader.map(el => {
      return {
        teamId: id,
        userId: el,
        leader: 1
      }
    });

    await AgentTeamMemberModel.bulkCreate(dataMember);

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.delete = async (req, res) => {
  try {
    const { password, id } = req.body;

    if (!password || password == '') {
      throw new Error('Mật khẩu không được để trống!');
    }

    const user = await UserModel.findOne({
      where: { id: Number(req.user.id), password: password }
    });

    if (!user) {
      return res.status(ERR_500.code).json({
        message: 'Mật khẩu không đúng!',
        type: 'password'
      });
    }

    await AgentTeamMemberModel.destroy({ where: { teamId: Number(id) } });
    await TeamModel.destroy({ where: { id: Number(id) } });

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.search = async (req, res) => {
  try {
    const { name } = req.query;
    const queryData = {};

    if (name) queryData.name = { [Op.eq]: name.trim() }

    const team = await TeamModel.findOne({
      where: { ...queryData },
      raw: true,
      nest: true,
    });

    if (!team) {
      throw new Error('Nhóm không tồn tại!');
    }

    return res.status(SUCCESS_200.code).json({
      data: team,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.addUser = async (req, res) => {
  try {
    const { userId, teamId } = req.body;

    if (!userId || !teamId) {
      throw new Error('Có lỗi xảy ra, vui lòng thử lại!');
    }

    let queryString = `
      SELECT 
        AgentTeamMembers.teamId AS teamId,
        Teams.name AS teamName,
        Users.id As userId,
        Users.userName AS userName,
        Users.fullName AS fullName
      FROM dbo.AgentTeamMembers
      LEFT JOIN dbo.Users ON AgentTeamMembers.userId = Users.id
      LEFT JOIN dbo.Teams ON AgentTeamMembers.teamId = Teams.id
      WHERE AgentTeamMembers.userId = ${Number(userId)}
    `;

    const teamFound = await model.sequelize.query(queryString, { type: QueryTypes.SELECT });

    if (teamFound && teamFound.length > 0) {
      let teamName = '';

      teamFound.forEach((item, index) => {
        if (index == 0) {
          teamName += item.teamName;
        } else if (index > 0) {
          teamName += ` và nhóm ${item.teamName}`;
        }
      });

      throw new Error(`Người dùng ${teamFound[0].fullName} đã thuộc nhóm ${teamName}`);
    }

    let createData = {
      teamId: Number(teamId),
      userId: Number(userId)
    }

    const result = await AgentTeamMemberModel.create(createData);

    return res.status(SUCCESS_200.code).json({
      data: result,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.removeUser = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    if (!teamId || !userId) {
      throw new Error('Có lỗi xảy ra, vui lòng thử lại!');
    }

    await AgentTeamMemberModel.destroy({
      where: {
        teamId: { [Op.eq]: Number(teamId) },
        userId: { [Op.eq]: Number(userId) }
      }
    });

    return res.status(SUCCESS_200.code).json({
      data: 'success',
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.userOfTeam = async (req, res) => {
  try {
    const { name, teamId } = req.query;
    let queryName = '';

    if (name) {
      queryName += `AND Users.fullName LIKE '%${name}%'`;
    }

    let queryString = `
      SELECT 
        Users.id As userId,
        Users.userName AS userName,
        Users.fullName AS fullName
      FROM dbo.AgentTeamMembers
      LEFT JOIN dbo.Users ON AgentTeamMembers.userId = Users.id
      WHERE AgentTeamMembers.teamId = ${Number(teamId)}
      ${queryName}
      ORDER BY AgentTeamMembers.id DESC
    `;

    const teamFound = await model.sequelize.query(queryString, { type: QueryTypes.SELECT });

    return res.status(SUCCESS_200.code).json({
      data: teamFound,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}