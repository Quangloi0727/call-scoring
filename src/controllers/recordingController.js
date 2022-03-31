
const pagination = require('pagination');
const { QueryTypes } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');
const { createExcelPromise } = require('../common/createExcel')
const {
  SUCCESS_200,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");
const {
  USER_ROLE
} = require("../helpers/constants/number");

const {
  cheSo
} = require("../helpers/functions");

const model = require('../models');
const ConfigurationColumsModel = require('../models/configurationcolums');
const titlePage = 'Danh sách cuộc gọi';
const SOURCE_NAME = {
  oreka : 'ORK',
  fs : 'FS',
}

exports.index = async (req, res, next) => {
  try {
    let isAdmin = false;

    if (req.user.roles.find((item) => item.role == 2)) {
      isAdmin = true;
    }

    const { teams, teamIds } = await checkLeader(req.user.id);

    let { teams: teamsDetail } = await getAgentTeamMemberDetail(isAdmin, teamIds, req.user.id);

    return _render(req, res, 'recording/index', {
      title: titlePage,
      titlePage: titlePage,
      teamsDetail:  _.uniqBy(teamsDetail, 'memberId'), // master data
      teams: _.uniqBy(teamsDetail, 'teamId') || [],
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return next(error);
  }
}

exports.getRecording = async (req, res) => {
  try {
    const {
      page,
      startTime,
      endTime,
      caller,
      called,
      extension,
      exportExcel,
      fullName,
      userName,
      teamName,
      callDirection,
      teams
    } = req.query;
    const limit = 25;
    const pageNumber = page ? Number(page) : 1;
    const offset = (pageNumber * limit) - limit;
    let userIdFilter = [];
    let query = '';
    let isAdmin = false;

    if (!startTime || startTime === '' || !endTime || endTime === '') {
      throw new Error('Thời gian bắt đầu và thời gian kết thúc là bắt buộc!')
    }

    if (req.user.roles.find((item) => item.role == 2)) {
      isAdmin = true;
    }

    const { teamIds } = await checkLeader(req.user.id);
    if (!isAdmin && (!teamIds || teamIds.length <= 0)) {
      query += `AND records.agentId = ${req.user.id} `;
    }

    if (!isAdmin && teamIds && teamIds.length > 0) {
      query += `AND ( records.agentId = ${req.user.id} OR records.teamId IN (${teamIds.toString()}) ) `;
    }

    if (caller) query += `AND records.caller LIKE '%${caller.toString()}%' `;
    if (called) query += `AND records.called LIKE '%${called.toString()}%' `;
    if (extension) query += `AND agent.extension LIKE '%${extension.toString()}%' `;
    // if (fullName) query += `AND agent.fullName LIKE '%${fullName.toString()}%' `;
    if (fullName) {
      userIdFilter = _.concat(userIdFilter, fullName);
    }
    if (userName) {
      userIdFilter = _.concat(userIdFilter, userName);
    }
    if(userIdFilter.length > 0){
      userIdFilter = _.uniq(userIdFilter).map(i => Number(i));

      query += `AND agent.id IN (${userIdFilter.join()}) `;

    }

    if (teamName) query += `AND team.name LIKE '%${teamName.toString()}%' `;
    if (callDirection) query += `AND records.direction IN (${callDirection.map((item) => "'" + item + "'").toString()}) `;
    if (teams) query += `AND team.id IN (${teams.toString()}) `;

    let startTimeMilisecond = moment(startTime, 'DD/MM/YYYY').startOf('day').format('X');
    let endTimeMilisecond = moment(endTime, 'DD/MM/YYYY').endOf('day').format('X');

    if (exportExcel && exportExcel == 1) {
      return exportExcelHandle(req, res, startTimeMilisecond, endTimeMilisecond, query);
    }

    let queryData = `
      SELECT
	      records.caller AS caller,
	      records.called AS called,
	      records.origTime AS origTime,
	      records.duration AS duration,
	      records.recordingFileName AS recordingFileName,
        records.direction AS direction,
	      agent.fullName AS fullName,
	      agent.userName AS userName,
        team.name AS teamName
      FROM dbo.call_detail_records records 
      LEFT JOIN dbo.Users agent ON records.agentId = agent.id
      LEFT JOIN dbo.Teams team ON records.teamId = team.id
      WHERE records.origTime >= ${Number(startTimeMilisecond)}  
        AND records.origTime <= ${Number(endTimeMilisecond)}
        AND records.sourceName = '${SOURCE_NAME.oreka}'
	      ${query}
      ORDER BY records.origTime DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    let queryCountData = `
      SELECT COUNT(*) AS total
      FROM dbo.call_detail_records records 
      LEFT JOIN dbo.Users agent ON records.agentId = agent.id
      LEFT JOIN dbo.Teams team ON records.teamId = team.id
      WHERE records.origTime >= ${Number(startTimeMilisecond)}  
        AND records.origTime <= ${Number(endTimeMilisecond)}
        AND records.sourceName = '${SOURCE_NAME.oreka}'
	      ${query}
    `;

    const [recordResult, totalData] = await Promise.all([
      await model.sequelize.query(queryData, { type: QueryTypes.SELECT }),
      await model.sequelize.query(queryCountData, { type: QueryTypes.SELECT }),
    ]);

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: totalData && totalData[0] && totalData[0].total || 0
    });
    const ConfigurationColums = await getConfigurationColums(req.user.id);

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: recordResult && handleData(recordResult, _config.privatePhoneNumberWebView) || [],
      ConfigurationColums: ConfigurationColums && ConfigurationColums.data && ConfigurationColums.data[0] ? ConfigurationColums.data[0].configurationColums : null,
      paging: paginator.getPaginationData()
    });
  } catch (error) {
    console.log(`------- error ------- getRecording`);
    console.log(error);
    console.log(`------- error ------- getRecording`);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}
exports.SaveConfigurationColums = async (req, res) => {
  let transaction;
  try {
    const data = {}
    data.userId = req.user.id;
    data.configurationColums = JSON.stringify(req.body);
    transaction = await model.sequelize.transaction();
    const result = await ConfigurationColumsModel.update(
      { configurationColums: JSON.stringify(req.body) },
      { where: { userId: Number(req.user.id) } },
      { transaction: transaction }
    );
    if (!result) {
      const _result = await ConfigurationColumsModel.create(data, { transaction: transaction });
    }
    await transaction.commit();
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

function getConfigurationColums(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const resulds = await model.sequelize.query(
        `
        SELECT *
        FROM dbo.configurationColums  
        WHERE userId = ${userId}    
        `,
        { type: QueryTypes.SELECT }
      );

      return resolve({ data: resulds });
    } catch (error) {
      return reject(error);
    }
  })
}

function checkLeader(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let teamIds = [];

      const resulds = await model.sequelize.query(
        `
          SELECT
            Teams.id AS teamId,
            Teams.name AS teamName 
          FROM dbo.AgentTeamMembers
          LEFT JOIN dbo.Teams ON AgentTeamMembers.teamId = Teams.id 
          WHERE AgentTeamMembers.userId = ${Number(userId)}
            AND AgentTeamMembers.role = 1
        `,
        { type: QueryTypes.SELECT }
      );

      teamIds = _.map(resulds, 'teamId');

      return resolve({ teams: resulds, teamIds: teamIds });
    } catch (error) {
      return reject(error);
    }
  });
}

function getAgentTeamMemberDetail(isAdmin, teamIds = [], userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let conditionQuery = '';
      if(isAdmin == true){
        conditionQuery = `team.name <> 'Default'`;
      }else {
        // sup
        if(teamIds.length > 0){
          conditionQuery = `team.id IN (${teamIds.join(',')}) and 
          AgentTeamMembers.role =  ${USER_ROLE.agent}`;
        }else {
          // agent
          conditionQuery = `AgentTeamMembers.userId = ${Number(userId)}`;
        }
        
      }
      const result = await model.sequelize.query(
        `
            SELECT
        team.id AS teamId,
        team.name AS teamName,
        memberOfTeam.id AS memberId,
        memberOfTeam.fullName AS memberFullName,
        memberOfTeam.userName AS memberUserName
      FROM dbo.Teams team
      LEFT JOIN dbo.AgentTeamMembers agentTeamMembers ON team.id = AgentTeamMembers.teamId
      LEFT JOIN dbo.Users memberOfTeam ON agentTeamMembers.userId = memberOfTeam.id
      
      WHERE ${conditionQuery}

      GROUP BY team.id, team.name, memberOfTeam.id, memberOfTeam.fullName, memberOfTeam.userName

        `,
        { type: QueryTypes.SELECT }
      );

     

      return resolve({ teams: result });
    } catch (error) {
      return reject(error);
    }
  });
}

function handleData(data, privatePhoneNumber = false) {
  let newData = [];

  newData = data.map((el) => {
    el.origTime = moment(el.origTime * 1000).format('HH:mm:ss DD/MM/YYYY')
    el.duration = hms(el.duration);
    el.recordingFileName = _config.pathRecording + el.recordingFileName;

    // che số
    if(privatePhoneNumber){
      if(el.caller && el.caller.length >= 10) el.caller = cheSo(el.caller, 4);
      if(el.called && el.called.length >= 10) el.called = cheSo(el.called, 4);
    }

    return el;
  });

  return newData;
}

async function exportExcelHandle(req, res, startTime, endTime, query) {
  try {
    const dataResult = await model.sequelize.query(`
      SELECT
	      records.caller AS caller,
	      records.called AS called,
	      records.origTime AS origTime,
	      records.duration AS duration,
	      records.recordingFileName AS recordingFileName,
        records.direction AS direction,
	      agent.fullName AS fullName,
	      agent.userName AS userName,
        team.name AS teamName
      FROM dbo.call_detail_records records 
      LEFT JOIN dbo.Users agent ON records.agentId = agent.id
      LEFT JOIN dbo.Teams team ON records.teamId = team.id
      WHERE records.origTime >= ${Number(startTime)}  
	      AND records.origTime <= ${Number(endTime)}
	      ${query}
      ORDER BY records.origTime DESC
    `, { type: QueryTypes.SELECT });

    const dataHandleResult = handleData(dataResult, _config.privatePhoneNumberExcel);

    const linkFile = await createExcelFile(startTime, endTime, dataHandleResult);

    return res.status(SUCCESS_200.code).json({ linkFile: linkFile });
  } catch (error) {
    throw new Error(error);
  }
}

function createExcelFile(startDate, endDate, data) {
  return new Promise(async (resolve, reject) => {
    try {

      let startTime = moment.unix(Number(startDate)).startOf('day').format('HH:mm DD/MM/YYYY');
      let endTime = moment.unix(Number(endDate)).endOf('day').format('HH:mm DD/MM/YYYY');

      let titleExcel = {
        TXT_DIRECTION: 'Hướng gọi',
        TXT_USER_NAME: 'Điện thoại viên',
        TXT_TEAM_NAME: 'Nhóm',
        TXT_CALLER: 'Số gọi đi',
        TXT_CALLED: 'Số gọi đến	',
        TXT_CREATE_TIME: 'Ngày giờ gọi',
        TXT_DURATION: 'Thời lượng'
      }

      let dataHeader = {
        TXT_DIRECTION: 'direction',
        TXT_USER_NAME: 'agentName',
        TXT_TEAM_NAME: 'teamName',
        TXT_CALLER: "caller",
        TXT_CALLED: "called",
        TXT_CREATE_TIME: "origTime",
        TXT_DURATION: "duration",
      }

      let newData = data.map((item) => {
        agentName = item.fullName && `${item.fullName} (${item.userName})` || '';

        return {
          ...item,
          duration: item.duration || '',
          agentName: agentName
        }
      });

      const linkFileExcel = await createExcelPromise({
        startTime: startTime,
        endTime: endTime,
        titleTable: titlePage,
        excelHeader: dataHeader,
        titlesHeader: titleExcel,
        data: newData,
        opts: {
          valueWidthColumn: [20, 30, 20, 20, 20, 20, 20, 20, 20],
        }
      });
      return resolve(linkFileExcel);
    } catch (error) {
      return reject(error);
    }
  })
}

function hms(secs) {
  if (isNaN(secs) || !secs || secs == 0) return '00:00:00';

  let sec = 0;
  let minutes = 0;
  let hours = 0;

  sec = Math.ceil(secs);
  minutes = Math.floor(sec / 60);
  sec = sec % 60;
  hours = Math.floor(minutes / 60)
  minutes = minutes % 60;

  return `${hours}:${pad(minutes)}:${pad(sec)}`;
}

function pad(num) {
  return ('0' + num).slice(-2);
}