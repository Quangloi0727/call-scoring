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
  ERR_500,
  ERR_400
} = require("../helpers/constants/statusCodeHTTP");
const {
  USER_ROLE,
  OP_UNIT_DISPLAY,
  STATUS_SCORE_SCRIPT,
  MESSAGE_ERROR
} = require("../helpers/constants/statusField");
const { getLengthField } = require('../helpers/functions');

const titlePage = 'Kịch bản chấm điểm';

exports.index = async (req, res, next) => {
  try {
    const users = await getUserByRole(UserModel, USER_ROLE.groupmanager.n);

    return _render(req, res, 'scoreScripts/index', {
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

exports.gets = async (req, res, next) => {
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
      FROM dbo.scoreScripts t_group
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
      FROM dbo.scoreScripts t_group
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

    // let scoreScripts = await model.Group.findAndCountAll({
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

async function handleResult(ids, scoreScripts) {
  try {
    if (!ids || ids.length <= 0) return scoreScripts;

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

    const dataResult = scoreScripts.map((item) => {
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

exports.create = async (req, res) => {
  let transaction;

  try {
    const data = req.body;

    // default
    data.needImproveMin = 0;

    const { scoreScripts } = req.body;

    // convert to number
    Object.keys(req.body).forEach(i => {
      let listNumber = [ 'criteriaDisplayType', 'needImproveMax', 'passStandardMin', 'scoreDisplayType', 'standardMax', 'standardMin', 'status' ];
      if(listNumber.includes(i) && req.body[i] != undefined){
        req.body[i] = Number(req.body[i]);
      }
    });
    // validate nhóm kịch bản
    if(scoreScripts && scoreScripts.length > 0){
      // neu co nhom tieu chi ma ko co tieu chi --> bao loi
      try {
        for (let i = 0; i < scoreScripts.length; i++) {
          
          const { criterias, nameCriteriaGroup, totalScore } = scoreScripts[i];
          if(!nameCriteriaGroup) throw new Error('Nhóm tiêu chí có tên rỗng');
          if(!criterias || criterias.length == 0) throw new Error('Nhóm tiêu chí có tiêu chí rỗng');
          
          // có tiêu chí mà không có lựa chọn thì báo lỗi 
          for (let i = 0; i < criterias.length; i++) {
            const {  nameCriteria, selectionCriterias } = criterias[i];
          
            if(!nameCriteria) throw new Error('Tiêu chí có tên rỗng');
            if(!selectionCriterias || selectionCriterias.length == 0) throw new Error('Tiêu chí có lựa chọn rỗng');
          }

        }
      } catch (error) {
        console.log('validate kịch bản lỗi: ', error);
        return res.status(ERR_400.code).json({ message: MESSAGE_ERROR['QA-007']});
      }
    }
    
    transaction = await model.sequelize.transaction();

    data.created = req.user.id;

    if (data.name && data.name.length > getLengthField('name')) {
      throw new Error(`Tên không được dài quá ${getLengthField('name')} kí tự!`);
    }

    if (data.description && data.description.length > getLengthField('description')) {
      throw new Error(`Mô tả không được dài quá ${getLengthField('description')} kí tự!`);
    }

    if (!data.name || data.name.trim() == '') {
      throw new Error('Tên không được để trống!');
    }

    /**
     * 1. tạo kịch bản chung
     * 2. tạo nhóm tiêu chí 
     * 3. --> tạo tiêu chí
     * 4. --> tạo lựa chọn
     */
    // 1. tạo kịch bản chung
    const scoreScriptResult = await model.ScoreScript.create(data, { transaction: transaction });
    // 2. tạo nhóm tiêu chí 
    let dataCriteriaGroups = scoreScripts.map(i => {
      return {
        name: i.nameCriteriaGroup,
        scoreScriptId: scoreScriptResult.id,
        created: data.created
      }
    });
    const criteriaGroupResult = await model.CriteriaGroup.bulkCreate(dataCriteriaGroups, { transaction: transaction });
    // 3. --> tạo tiêu chí
    let dataCriterias = [];

    scoreScripts.forEach((i, index) => {

      i.criterias.forEach(j => {
        dataCriterias.push({
          name: j.nameCriteria,
          scoreMax: j.scoreMax,
          isActive: j.isActive,
          criteriaGroupId: criteriaGroupResult[index].id,
          created: data.created,
          selectionCriterias: j.selectionCriterias
        })
      });

    });
    const criteriaResult = await model.Criteria.bulkCreate(dataCriterias, { transaction: transaction });
    
    // 3. --> tạo lựa chọn
    let dataSelectionCriterias = [];
    dataCriterias.forEach((i, index) => {

      i.selectionCriterias.forEach(j => {
        dataSelectionCriterias.push({
          name: j.name,
          score: Number(j.score),
          unScoreCriteriaGroup: j.unScoreCriteriaGroup,
          unScoreScript: j.unScoreScript,
          criteriaId: criteriaResult[index].id,
          created: data.created,
        })
      });

    });

    const selectionCriteriasResult = await model.SelectionCriteria.bulkCreate(dataSelectionCriterias, { transaction: transaction });

    // let dataMember = data.leader.map(el => {
    //   return {
    //     groupId: scoreScriptResult.id,
    //     userId: Number(el),
    //     role: USER_ROLE.groupmanager.n
    //   }
    // });

    // await model.UserGroupMember.bulkCreate(dataMember, { transaction: transaction });

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

exports.new = async (req, res, next) => {
  try {
    
    let [users, groupInfo] = await Promise.all([
      getUserByRole(model.User, USER_ROLE.groupmanager.n),
      model.Group.findOne({
        // where: { id: { [Op.eq]: Number(id) } },
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

    return _render(req, res, 'scoreScripts/new', {
      titlePage: null,
      group: groupInfo,
      users: users,
      OP_UNIT_DISPLAY,
      STATUS_SCORE_SCRIPT
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return next(error);
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

    return _render(req, res, 'scoreScripts/detail', {
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