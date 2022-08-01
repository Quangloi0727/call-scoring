const { Op, QueryTypes } = require('sequelize');
const pagination = require('pagination');
const moment = require('moment');
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
    const users = await getUserByRole(UserModel, USER_ROLE.groupmanager.n);

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

async function getUserByRole(_model, role) {
  if(!role) throw new Error('role is required!');
  
  return await _model.findAll({
    where: {
      [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
    },
    include: [{
      model: UserRoleModel,
      as: 'roles',
      where: {
        role: { [Op.eq]: role }
      }
    }],
    raw: true,
    nest: true
  });
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
    // let queryWhere = {};

    if (name) {
      query += `WHERE (t_group.name LIKE '%${name}%' OR UserGroupMembers1.leaderDetails LIKE '%${name}%')`;
      // queryWhere = {
      //   [Op.or]: [
      //     { "$name$" : { [Op.like]: `%${name}%` } },
      //     { "$UserGroupMember.user.fullName$": { [Op.like]: `%${name}%` } },
      //     { "$UserGroupMember.user.userName$": { [Op.like]: `%${name}%` } },
      //     // { "$TeamGroup.groupId$" : { [Op.not]: id } },
      //   ]
      // }
    }

    let queryDataString = `
      SELECT
        t_group.id AS groupId,
        min(t_group.name) AS groupName,
        min(t_group.description) AS description,
        min(t_group.createdAt) AS createdAt,
        min(agent.id) AS createdId,
        min(agent.fullName) AS createdName,
        Sum(case when UserGroupMembers1.counts > 0 then UserGroupMembers1.counts else 0 end) as leaders,
				min(UserGroupMembers1.leaderDetails) as leaderDetails,
				Sum(case when teamGroup1.counts > 0 then teamGroup1.counts else 0 end) as members
      FROM dbo.groups t_group
      LEFT JOIN dbo.Users agent -- nguoi tao
				ON t_group.created = agent.id
      LEFT JOIN (SELECT
        UserGroupMembers.groupId,
        string_agg(concat(Users.fullName, ' (', Users.userName, ')'), ';') as leaderDetails,
        count(UserGroupMembers.groupId) as counts
              FROM dbo.UserGroupMembers 
              LEFT JOIN dbo.Users Users -- leader info
                ON UserGroupMembers.userId = Users.id
                
              where role =  ${USER_ROLE.groupmanager.n}
              group by UserGroupMembers.groupId) UserGroupMembers1 -- leader
				ON t_group.id = UserGroupMembers1.groupId
			LEFT JOIN (SELECT
        TeamGroups.groupId,
        count(TeamGroups.groupId) as counts
              FROM dbo.TeamGroups
              group by TeamGroups.groupId) teamGroup1 -- member
        ON teamGroup1.groupId = t_group.id
      ${query}
      GROUP BY t_group.id
      ORDER BY t_group.id DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    let queryCountString = `
      SELECT COUNT(*) AS total
      FROM dbo.groups t_group
      LEFT JOIN dbo.Users agent ON t_group.created = agent.id
      LEFT JOIN (SELECT
        UserGroupMembers.groupId,
        string_agg(concat(Users.fullName, ' (', Users.userName, ')'), ';') as leaderDetails,
        count(UserGroupMembers.groupId) as counts
              FROM dbo.UserGroupMembers 
              LEFT JOIN dbo.Users Users -- leader info
                ON UserGroupMembers.userId = Users.id
                
              where role =  ${USER_ROLE.groupmanager.n}
              group by UserGroupMembers.groupId) UserGroupMembers1 -- leader
				ON t_group.id = UserGroupMembers1.groupId
      ${query}
      GROUP BY t_group.id
    `;

    // let groups = await model.Group.findAndCountAll({
    //   where: queryWhere,
    //   order: [['id', 'DESC']],
    //   limit,
    //   offset,
    //   distinct: true,
    //   include: [
    //     { model: model.User, as: 'userCreate' },
    //     { 
    //       model: model.UserGroupMember, 
    //       as: 'UserGroupMember',
    //       include: { model: model.User, as: 'user' },
    //       where : {
    //         role: USER_ROLE.groupmanager.n
    //       }
    //     },
    //     { 
    //       model: model.TeamGroup, 
    //       as: 'TeamGroup',
    //       // include: { model: model.User, as: 'user' },
    //       // where : {
    //       //   role: USER_ROLE.groupmanager.n
    //       // }
    //     }
    //   ],

    //   // raw: true,
    //   nest: true
    // })

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
      throw new Error('Quản lý nhóm không được để trống!');
    }

    const groupCreateResult = await model.Group.create(data, { transaction: transaction });

    let dataMember = data.leader.map(el => {
      return {
        groupId: groupCreateResult.id,
        userId: Number(el),
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

exports.detail = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id == '') {
      throw new Error('Nhóm không tồn tại!');
    }
    
    let [users, groupInfo] = await Promise.all([
      getUserByRole(model.User, USER_ROLE.groupmanager.n),
      model.Group.findOne({
        where: { id: { [Op.eq]: Number(id) } },
        include: [
          { model: model.User, as: 'userCreate' },
          { 
            model: model.UserGroupMember, 
            as: 'UserGroupMember',
            include: { model: model.User, as: 'User' },
            where : {
              role: USER_ROLE.groupmanager.n
            }
          },
          { 
            model: model.TeamGroup, 
            as: 'TeamGroup',
            // include: { model: model.User, as: 'user' },
            // where : {
            //   role: USER_ROLE.groupmanager.n
            // }
          }
        ],
        // raw: true,
        nest: true
      })
    ]);
    // let _group = {...groupInfo};

    // _group.createdAt = moment(new Date(groupInfo.createdAt)).format('HH:mm:ss DD/MM/YYYY');
    // _group.updatedAt = moment(new Date(groupInfo.updatedAt)).format('HH:mm:ss DD/MM/YYYY');

    return _render(req, res, 'groups/detail', {
      titlePage: null,
      group: groupInfo,
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

    await model.Group.update(
      dataUpdate,
      { where: { id: Number(id) } },
      { transaction: transaction }
    );

    await model.UserGroupMember.destroy(
      { where: { groupId: Number(id), role: USER_ROLE.groupmanager.n } },
      { transaction: transaction }
    );

    let dataMember = leader.map(el => {
      return {
        groupId: id,
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

    // if (!password || password == '') {
    //   throw new Error('Mật khẩu không được để trống!');
    // }

    // const user = await UserModel.findOne({
    //   where: { id: Number(req.user.id), password: password }
    // });

    // if (!user) {
    //   return res.status(ERR_500.code).json({
    //     message: 'Mật khẩu không đúng!',
    //     type: 'password'
    //   });
    // }


    Promise.all([
      await model.UserGroupMember.destroy({ where: { groupId: Number(id) } }),
      await model.TeamGroup.destroy({ where: { groupId: Number(id) } }),
      await model.Group.destroy({ where: { id: Number(id) } })
    ])

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

    const team = await model.Group.findOne({
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

exports.addTeam = async (req, res) => {
  let transaction;

  try {
    let { groupId, teamIds } = req.body;
    transaction = await model.sequelize.transaction();

    if (!groupId || !teamIds) {
      throw new Error('Có lỗi xảy ra, vui lòng thử lại!');
    }
    
    if (teamIds.length == 0) {
      throw new Error('Số lượng nhóm không hợp lệ!');
    }
    groupId = Number(groupId);
    teamIds = teamIds.map(Number);


    const result = await model.TeamGroup.bulkCreate(
      teamIds.map(i => {
        return {
          teamId: i,
          groupId: groupId
        }
      }), { transaction: transaction });

    // await UserModel.update(
    //   { isAvailable: 1 },
    //   { where: { id: Number(userId) } },
    //   { transaction: transaction }
    // );

    await transaction.commit();
    // const age = 5;
    // age = 6;

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

exports.removeTeam = async (req, res) => {
  let transaction;

  try {
    const { teamId, groupId } = req.body;

    transaction = await model.sequelize.transaction();

    if (!teamId || !groupId) {
      throw new Error('Có lỗi xảy ra, vui lòng thử lại!');
    }

    await model.TeamGroup.destroy({
      where: {
        teamId: { [Op.eq]: Number(teamId) },
        groupId: { [Op.eq]: Number(groupId) }
      }
    }, { transaction: transaction });

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

exports.teamOfGroup = async (req, res) => {
  try {
    let { name, groupId } = req.query;
    let queryWhere = {};

    groupId = Number(groupId);

    if (!groupId ) {
      throw new Error('groupId là trường bắt buộc!');
    }
    queryWhere.groupId = { [Op.eq]: groupId };

    if (name) {
      queryWhere["$Team.name$"] = { [Op.like]: `%${name}%` };
    }

    const teamFound = await model.TeamGroup.findAll({
      where: queryWhere,
      include: [{
        model: model.Team,
        as: 'Team',
        // required: false,
        // where: {
          
        // }
      }],
      // raw: true,
      nest: true
    });

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

exports.getTeamAvailable = async (req, res) => {
  try {
    let { id, teamIds } = req.query;
    id = Number(id);
    
    if (!id || id == '') {
      throw new Error('Nhóm không tồn tại!');
    }
    let queryOr = [{ "$TeamGroup.groupId$" : { [Op.eq]: null } }];
    if(teamIds && teamIds.length > 0) queryOr.push( { "$TeamGroup.teamId$": { [Op.notIn]: teamIds.map(Number) }  });
    else queryOr.push( { "$TeamGroup.groupId$" : { [Op.not]: id } } );
    const itemAvailable = await model.Team.findAll({
      include: [{
        model: model.TeamGroup,
        as: 'TeamGroup',
        required: false, // left outer join
        // where: {
          
        // }
      }],
      where: {
        
        [Op.or]: queryOr
      },
      // distince: true,
      // raw: true,
      nest: true
    });

    return res.status(SUCCESS_200.code).json({
      data: itemAvailable,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}