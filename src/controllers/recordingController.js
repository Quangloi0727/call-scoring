
const pagination = require('pagination');
const { QueryTypes } = require('sequelize');
const moment = require('moment');
const { createExcelPromise } = require('../common/createExcel')
const {
  SUCCESS_200,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");
const model = require('../models');

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

    if (caller) query += `AND records.caller LIKE '%${caller}%' `;
    if (called) query += `AND records.called LIKE '%${called}%' `;
    if (extension) query += `AND records.caller LIKE '%${extension}%' `;

    let startTimeMilisecond = moment(startTime, 'DD/MM/YYYY').startOf('day').format('X');
    let endTimeMilisecond = moment(endTime, 'DD/MM/YYYY').endOf('day').format('X');

    if (exportExcel && exportExcel == 1) {
      return exportExcelHandle(res, startTimeMilisecond, endTimeMilisecond, query);
    }

    let queryData = `
      SELECT * FROM call_detail_records records
      WHERE records.origTime >= ${Number(startTimeMilisecond)} 
        AND records.origTime <= ${Number(endTimeMilisecond)}
        ${query}
      ORDER BY records.origTime DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    let queryCountData = `
      SELECT COUNT(*) AS total
      FROM call_detail_records records
      WHERE records.origTime >= ${Number(startTimeMilisecond)} 
        AND records.origTime <= ${Number(endTimeMilisecond)}
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


async function exportExcelHandle(res, startTime, endTime, query) {
  try {
    const dataResult = await model.sequelize.query(`
      SELECT * FROM call_detail_records records
      WHERE records.origTime >= ${Number(startTime)} 
        AND records.origTime <= ${Number(endTime)}
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
        TXT_EXTENSION: 'Extension',
        TXT_CALLER: 'Số gọi đi',
        TXT_CALLED: 'Số gọi đến	',
        TXT_CREATE_TIME: 'Ngày giờ gọi',
        TXT_DURATION: 'Thời lượng'
      }

      let dataHeader = {
        TXT_EXTENSION: "caller",
        TXT_CALLER: "caller",
        TXT_CALLED: "called",
        TXT_CREATE_TIME: "origTime",
        TXT_DURATION: "duration",
      }

      const linkFileExcel = await createExcelPromise({
        startTime: startTime,
        endTime: endTime,
        titleTable: titlePage,
        excelHeader: dataHeader,
        titlesHeader: titleExcel,
        data: data,
        opts: {
          valueWidthColumn: [25, 25, 30, 25, 35, 35],
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