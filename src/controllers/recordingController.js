
const pagination = require('pagination');
const { QueryTypes, Op } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');
const { createExcelPromise } = require('../common/createExcel')
const {
  SUCCESS_200,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");
const model = require('../models');
const AgentTeamMember = require('../models/agentTeamMember');

const titlePage = 'Danh sách cuộc gọi';

exports.index = async (req, res, next) => {
  try {
    return _render(req, res, 'recording/index', {
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

exports.getRecording = async (req, res, next) => {
  try {
    const { page, startTime, endTime, caller, called, extension, exportExcel } = req.query;
    const limit = 25;
    const pageNumber = page ? Number(page) : 1;
    const offset = (pageNumber * limit) - limit;
    let query = '';

    if (!startTime || startTime === '' || !endTime || endTime === '') {
      throw new Error('Thời gian bắt đầu và thời gian kết thúc là bắt buộc!')
    }

    const teamIds = await checkLeader(req.user.id);

    if (teamIds && teamIds.length > 0) query += `OR records.teamId IN (${teamIds.toString()})`
    if (caller) query += `AND records.caller LIKE '%${caller}%' `;
    if (called) query += `AND records.called LIKE '%${called}%' `;
    if (extension) query += `AND agent.extension LIKE '%${extension}%' `;

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
	      agent.extension AS extension,
	      agent.fullName AS fullName,
	      agent.userName AS userName,
        team.name AS teamName,
	      CASE
		      WHEN records.caller = agent.extension THEN 'OUTBOUND'
		      WHEN records.called = agent.extension THEN 'INBOUND'
		      ELSE ''
        END AS direction 
      FROM dbo.call_detail_records records 
      LEFT JOIN dbo.Users agent ON records.agentId = agent.id
      LEFT JOIN dbo.Teams team ON records.teamId = team.id
      WHERE records.origTime >= ${Number(startTimeMilisecond)}  
	      AND records.origTime <= ${Number(endTimeMilisecond)}
	      AND records.agentId = ${req.user.id}
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
	      AND records.agentId = ${req.user.id}
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

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: recordResult && handleData(recordResult) || [],
      paging: paginator.getPaginationData()
    });
  } catch (error) {
    console.log(`------- error ------- getRecording`);
    console.log(error);
    console.log(`------- error ------- getRecording`);

    return res.status(ERR_500.code).json({ message: error.message });
  }
}

async function checkLeader(userId) {
  try {
    let teamId = [];

    const resulds = await AgentTeamMember.findAll({
      where: {
        userId: { [Op.eq]: Number(userId) },
        role: { [Op.eq]: 1 }
      },
      raw: true,
      nest: true,
    });

    teamId = _.map(resulds, 'teamId');

    return Promise.resolve(teamId);
  } catch (error) {
    return Promise.reject(error);
  }
}

function handleData(data) {
  let newData = [];

  newData = data.map((el) => {
    el.origTime = moment(el.origTime * 1000).format('DD/MM/YYYY HH:mm:ss')
    el.duration = hms(el.duration);
    el.recordingFileName = _config.pathRecording + el.recordingFileName
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
	      agent.extension AS extension,
	      agent.fullName AS fullName,
	      agent.userName AS userName,
        team.name AS teamName,
	      CASE
		      WHEN records.caller = agent.extension THEN 'OUTBOUND'
		      WHEN records.called = agent.extension THEN 'INBOUND'
		      ELSE ''
        END AS direction 
      FROM dbo.call_detail_records records 
      LEFT JOIN dbo.Users agent ON records.agentId = agent.id
      LEFT JOIN dbo.Teams team ON records.teamId = team.id
      WHERE records.origTime >= ${Number(startTime)}  
	      AND records.origTime <= ${Number(endTime)}
	      AND records.agentId = ${req.user.id}
	      ${query}
      ORDER BY records.origTime DESC
    `, { type: QueryTypes.SELECT });

    const dataHandleResult = handleData(dataResult);

    const linkFile = await createExcelFile(startTime, endTime, dataHandleResult);

    return res.status(SUCCESS_200.code).json({ linkFile: linkFile });
  } catch (error) {
    throw new Error(error);
  }
}

function createExcelFile(startDate, endDate, data) {
  return new Promise(async (resolve, reject) => {
    try {

      let startTime = moment(startDate, 'DD/MM/YYYY').startOf('day').format('HH:mm YYYY-MM-DD');
      let endTime = moment(endDate, 'DD/MM/YYYY').endOf('day').format('HH:mm YYYY-MM-DD');

      let titleExcel = {
        TXT_DIRECTION: 'Hướng gọi',
        TXT_USER_NAME: 'Điện thoại viên',
        TXT_TEAM_NAME: 'Nhóm',
        TXT_EXTENSION: 'Extension',
        TXT_CALLER: 'Số gọi đi',
        TXT_CALLED: 'Số gọi đến	',
        TXT_CREATE_TIME: 'Ngày giờ gọi',
        TXT_DURATION: 'Thời lượng'
      }

      let dataHeader = {
        TXT_DIRECTION: 'direction',
        TXT_USER_NAME: 'agentName',
        TXT_TEAM_NAME: 'teamName',
        TXT_EXTENSION: "extension",
        TXT_CALLER: "caller",
        TXT_CALLED: "called",
        TXT_CREATE_TIME: "origTime",
        TXT_DURATION: "duration",
      }

      let newData = data.map((item) => {
        return {
          ...item,
          agentName: `${item.fullName} (${item.userName})`
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
          valueWidthColumn: [25, 25, 30, 25, 35, 35, 35, 35, 35],
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