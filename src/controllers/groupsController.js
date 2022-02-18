const { Op, QueryTypes } = require('sequelize');
const pagination = require('pagination');
const moment = require('moment');
const _ = require('lodash');
const UserModel = require('../models/user');
const UserRoleModel = require('../models/userRole');
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
      include: [{
        model: UserRoleModel,
        as: 'roles',
        where: {
          role: { [Op.eq]: 1 }
        }
      }],
      raw: true,
      nest: true
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
    let query = '';

    if (name) query += `AND (team.name LIKE '%${name}%' OR memberOfTeam.fullName LIKE '%${name}%' OR memberOfTeam.userName LIKE '%${name}%')`;

    let queryDataString = `
      SELECT
        team.id AS teamId,
        team.name AS teamName,
        team.description AS description,
        team.createdAt AS createdAt,
        agent.id AS createdId,
        agent.fullName AS createdName,
        MIN(memberOfTeam.id) AS memberId,
        MIN(memberOfTeam.fullName) AS memberFullName,
        MIN(memberOfTeam.userName) AS memberUserName
      FROM dbo.Teams team
      LEFT JOIN dbo.Users agent ON team.created = agent.id
      LEFT JOIN dbo.AgentTeamMembers agentTeamMembers ON team.id = AgentTeamMembers.teamId
      LEFT JOIN dbo.Users memberOfTeam ON agentTeamMembers.userId = memberOfTeam.id
      WHERE ( AgentTeamMembers.role = 1 OR AgentTeamMembers.role = 2 )
      ${query}
      GROUP BY team.id, team.name, team.createdAt, team.description, agent.id, agent.fullName
      ORDER BY team.id DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    let queryCountString = `
      SELECT COUNT(*) AS total
      FROM dbo.Teams team
      LEFT JOIN dbo.Users agent ON team.created = agent.id
      LEFT JOIN dbo.AgentTeamMembers agentTeamMembers ON team.id = AgentTeamMembers.teamId
      LEFT JOIN dbo.Users memberOfTeam ON agentTeamMembers.userId = memberOfTeam.id
      WHERE ( AgentTeamMembers.role = 1 OR AgentTeamMembers.role = 2 )
      ${query}
      GROUP BY team.id, team.name, agent.id, agent.fullName
    `;

    const [groupsResult, total] = await Promise.all([
      await model.sequelize.query(queryDataString, { type: QueryTypes.SELECT }),
      await model.sequelize.query(queryCountString, { type: QueryTypes.SELECT }),
    ]);

    const teamIds = _.map(groupsResult, 'teamId');

    const dataResult = await handleTeam(teamIds, groupsResult);

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: total && total.length || 0,
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
    if (!teamIds || teamIds.length <= 0) return teams;

    let queryString = `
      SELECT 
        AgentTeamMembers.teamId AS teamId,
        AgentTeamMembers.role AS role,
        Users.id As userId,
        Users.userName AS userName,
        Users.fullName AS fullName
      FROM dbo.AgentTeamMembers
      LEFT JOIN dbo.Users ON AgentTeamMembers.userId = Users.id
      WHERE AgentTeamMembers.teamId IN ( ${teamIds.toString()} )
    `;

    const agentTeamMember = await model.sequelize.query(queryString, { type: QueryTypes.SELECT });

    const dataResult = teams.map((team) => {
      const result = agentTeamMember.filter((agentOfTeam) => agentOfTeam.teamId == team.teamId);
      return {
        ...team,
        member: result,
        createdAt: moment(team.createdAt).format('HH:mm:ss DD/MM/YYYY')
      };
    });

    return dataResult;
  } catch (error) {
    throw new Error(error);
  }
}

exports.createGroup = async (req, res) => {
  let transaction;

  try {
    const data = req.body;

    transaction = await model.sequelize.transaction();

    data.created = req.user.id;

    if (data.name && data.name.length > 50) {
      throw new Error('Tên nhóm không được dài quá 50 kí tự!');
    }

    if (data.description && data.description.length > 500) {
      throw new Error('Mô tả không được dài quá 500 kí tự!');
    }

    if (!data.name || data.name.trim() == '') {
      throw new Error('Tên nhóm không được để trống!');
    }

    if (!data.leader || data.leader.length <= 0) {
      throw new Error('Giát sát nhóm không được để trống!');
    }

    const teamCreateResult = await TeamModel.create(data, { transaction: transaction });

    let dataMember = data.leader.map(el => {
      return {
        teamId: teamCreateResult.id,
        userId: el,
        role: 1
      }
    });

    await AgentTeamMemberModel.bulkCreate(dataMember, { transaction: transaction });

    await transaction.commit();

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    });
  } catch (error) {
    console.log(`------- error ------- getRecording`);
    console.log(error);
    console.log(`------- error ------- getRecording`);

    if (transaction) await transaction.rollback();

    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.detail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id == '') {
      throw new Error('Nhóm không tồn tại!');
    }

    let queryString = `
      SELECT
        Users.id AS userId,
        Users.userName AS userName,
        Users.fullName AS fullName,
        CASE
          WHEN Users.id IN (
            SELECT AgentTeamMembers.userId FROM dbo.AgentTeamMembers 
            WHERE AgentTeamMembers.teamId = ${Number(id)}
              AND AgentTeamMembers.role = 1
          ) THEN 1 
          ELSE 0
        END AS leader 
      FROM dbo.Users
      LEFT JOIN dbo.UserRoles ON Users.id = UserRoles.userId 
      WHERE UserRoles.role = 1
    `;

    const [users, team] = await Promise.all([
      model.sequelize.query(queryString, { type: QueryTypes.SELECT }),
      TeamModel.findOne({
        where: { id: { [Op.eq]: Number(id) } },
        include: [{ model: UserModel, as: 'userCreate' }],
        raw: true,
        nest: true
      })
    ]);

    team.createdAt = moment(team.createdAt).format('HH:mm:ss DD/MM/YYYY');
    team.updatedAt = moment(team.updatedAt).format('HH:mm:ss DD/MM/YYYY');

    return _render(req, res, 'groups/detail', {
      titlePage: null,
      team: team,
      users: users,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return next(error);
  }
}

exports.update = async (req, res) => {
  let transaction;

  try {
    const { description, name, id, leader } = req.body;

    transaction = await model.sequelize.transaction();

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
      { transaction: transaction }
    );

    await AgentTeamMemberModel.destroy(
      { where: { teamId: Number(id), role: 1 } },
      { transaction: transaction }
    );

    let dataMember = leader.map(el => {
      return {
        teamId: id,
        userId: el,
        role: 1
      }
    });

    await AgentTeamMemberModel.bulkCreate(dataMember, { transaction: transaction });

    await transaction.commit();

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    if (transaction) await transaction.rollback();

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
  let transaction;

  try {
    const { userId, teamId } = req.body;

    transaction = await model.sequelize.transaction();

    if (!userId || !teamId) {
      throw new Error('Có lỗi xảy ra, vui lòng thử lại!');
    }

    const result = await AgentTeamMemberModel.create({
      teamId: Number(teamId),
      userId: Number(userId),
      role: 0,
    }, { transaction: transaction });

    await UserModel.update(
      { isAvailable: 1 },
      { where: { id: Number(userId) } },
      { transaction: transaction }
    );

    await transaction.commit();

    return res.status(SUCCESS_200.code).json({
      data: result,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    if (transaction) await transaction.rollback();

    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.removeUser = async (req, res) => {
  let transaction;

  try {
    const { teamId, userId } = req.body;

    transaction = await model.sequelize.transaction();

    if (!teamId || !userId) {
      throw new Error('Có lỗi xảy ra, vui lòng thử lại!');
    }

    await AgentTeamMemberModel.destroy({
      where: {
        teamId: { [Op.eq]: Number(teamId) },
        userId: { [Op.eq]: Number(userId) },
        role: { [Op.eq]: 0 }
      }
    }, { transaction: transaction });

    await UserModel.update(
      { isAvailable: 0 },
      { where: { id: Number(userId) } },
      { transaction: transaction }
    );

    await transaction.commit();

    return res.status(SUCCESS_200.code).json({
      data: 'success',
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    if (transaction) await transaction.rollback();

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
      AND AgentTeamMembers.role = 0
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

exports.getUserAvailable = async (req, res) => {
  try {

    const userAvailable = await UserModel.findAll({
      where: {
        isAvailable: { [Op.eq]: 0 }
      },
      include: [{
        model: UserRoleModel,
        as: 'roles',
        where: {
          role: { [Op.eq]: 0 }
        }
      }],
      raw: true,
      nest: true
    });

    return res.status(SUCCESS_200.code).json({
      data: userAvailable,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}