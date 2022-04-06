const { Op, QueryTypes } = require('sequelize');
const pagination = require('pagination');
const moment = require('moment');
const _ = require('lodash');
const UserModel = require('../models/user');
const UserRoleModel = require('../models/userRole');
// const model.Team = require('../models/group');
const AgentTeamMemberModel = require('../models/agentTeamMember');
const model = require('../models');
const {
  SUCCESS_200,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");
const {
  USER_ROLE
} = require("../helpers/constants/statusField");

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
          role: { [Op.eq]: USER_ROLE.groupmanager.n }
        }
      }],
      raw: true,
      nest: true
    });

    return _render(req, res, 'groups/index', {
      title: titlePage,
      titlePage: titlePage,
      users: users,
      USER_ROLE,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return next(error);
  }
}

exports.getgroups = async (req, res, next) => {
  try {
    const { page, name } = req.query;
    let { limit } = req.query;
    if(!limit) limit = process.env.LIMIT_DOCUMENT_PAGE;
    
    limit = Number(limit);

    const pageNumber = page ? Number(page) : 1;
    const offset = (pageNumber * limit) - limit;
    let query = '';

    if (name) query += `AND (t_group.name LIKE '%${name}%' OR memberOfTeam.fullName LIKE '%${name}%' OR memberOfTeam.userName LIKE '%${name}%')`;

    let queryDataString = `
      SELECT
        t_group.id AS groupId,
        t_group.name AS groupName,
        t_group.description AS description,
        t_group.createdAt AS createdAt,
        agent.id AS createdId,
        agent.fullName AS createdName,
        Sum(case when Users.id is not null then 1 else 0 end) as leaders,
				string_agg(concat(Users.fullName, ' (', Users.userName, ')'), ';') as leaderDetails,
				Sum(case when TeamGroups.id is not null then 1 else 0 end) as members
      FROM dbo.groups t_group
      LEFT JOIN dbo.Users agent -- nguoi tao
				ON t_group.created = agent.id
      LEFT JOIN dbo.UserGroupMembers UserGroupMembers -- leader
				ON t_group.id = UserGroupMembers.groupId
				AND UserGroupMembers.role = ${USER_ROLE.groupmanager.n}
      LEFT JOIN dbo.Users Users -- leader info
				ON UserGroupMembers.userId = Users.id
			LEFT JOIN dbo.TeamGroups TeamGroups -- member
        ON TeamGroups.groupId = t_group.id
      ${query}
      GROUP BY t_group.id, t_group.name, t_group.createdAt, t_group.description, agent.id, agent.fullName
      ORDER BY t_group.id DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    let queryCountString = `
      SELECT COUNT(*) AS total
      FROM dbo.groups t_group
      LEFT JOIN dbo.Users agent ON t_group.created = agent.id
      LEFT JOIN dbo.UserGroupMembers UserGroupMembers ON t_group.id = UserGroupMembers.groupId
      LEFT JOIN dbo.Users Users ON UserGroupMembers.userId = Users.id
      WHERE ( UserGroupMembers.role = ${USER_ROLE.groupmanager.n} )
      ${query}
      GROUP BY t_group.id, t_group.name, agent.id, agent.fullName
    `;

    const [groupsResult, total] = await Promise.all([
      await model.sequelize.query(queryDataString, { type: QueryTypes.SELECT }),
      await model.sequelize.query(queryCountString, { type: QueryTypes.SELECT }),
    ]);

    const teamIds = _.map(groupsResult, 'groupId');

    const dataResult = await handleResult(teamIds, groupsResult);

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: total && total.length || 0,
    });

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: dataResult || [],
      paginator: {...paginator.getPaginationData(), rowsPerPage: limit},
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return res.status(ERR_500.code).json({ message: error.message });
  }
}

async function handleResult(ids, groups) {
  try {
    if (!ids || ids.length <= 0) return groups;

    let queryString = `
      SELECT 
        UserGroupMembers.groupId AS groupId,
        UserGroupMembers.role AS role,
        Users.id As userId,
        Users.userName AS userName,
        Users.fullName AS fullName
      FROM dbo.UserGroupMembers
      LEFT JOIN dbo.Users ON UserGroupMembers.userId = Users.id
      WHERE UserGroupMembers.groupId IN ( ${ids.toString()} )
    `;

    const userMembers = await model.sequelize.query(queryString, { type: QueryTypes.SELECT });

    const dataResult = groups.map((item) => {
      const result = userMembers.filter((itemMember) => itemMember.groupId == item.groupId);
      return {
        ...item,
        member: result,
        createdAt: moment(item.createdAt).format('HH:mm:ss DD/MM/YYYY')
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

    const groupCreateResult = await model.Group.create(data, { transaction: transaction });

    let dataMember = data.leader.map(el => {
      return {
        groupId: groupCreateResult.id,
        userId: el,
        role: USER_ROLE.groupmanager.n
      }
    });

    await model.UserGroupMember.bulkCreate(dataMember, { transaction: transaction });

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
      model.t_group.findOne({
        where: { id: { [Op.eq]: Number(id) } },
        include: [{ model: UserModel, as: 'userCreate' }],
        raw: true,
        nest: true
      })
    ]);

    t_group.createdAt = moment(t_group.createdAt).format('HH:mm:ss DD/MM/YYYY');
    t_group.updatedAt = moment(t_group.updatedAt).format('HH:mm:ss DD/MM/YYYY');

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

    await model.t_group.update(
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
    await model.t_group.destroy({ where: { id: Number(id) } });

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

    const team = await model.t_group.findOne({
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