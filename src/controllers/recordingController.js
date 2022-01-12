
const { getRepository, Between, Like } = require('typeorm');
const pagination = require('pagination');
const moment = require('moment');
const CallDetailRecording = require('../entities/CallDetailRecordSchema');
const { createExcelPromise } = require('../common/createExcel')
const {
  SUCCESS_200,
  ERR_400,
  ERR_404,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");

const titlePage = 'Danh sách cuộc gọi';

exports.index = async (req, res, next) => {
  try {
    return res.render('pages/index', {
      page: 'recording/index',
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
    const recordingRepository = getRepository(CallDetailRecording);
    let query = {};

    if (!startTime || startTime === '' || !endTime || endTime === '') {
      throw new Error('Thời gian bắt đầu và thời gian kết thúc là bắt buộc!')
    }

    if (caller) query.caller = Like(`%${caller}%`);
    if (called) query.called = Like(`%${called}%`);
    if (extension) query.caller = Like(`%${extension}%`);

    let startTimeMilisecond = moment(startTime, 'DD/MM/YYYY').startOf('day').format('X');
    let endTimeMilisecond = moment(endTime, 'DD/MM/YYYY').endOf('day').format('X');

    if (exportExcel && exportExcel == 1) {
      const dataResult = await recordingRepository.find({
        where: {
          origTime: Between(Number(startTimeMilisecond), Number(endTimeMilisecond)),
          ...query
        },
      });

      const dataHandleResult = handleData(dataResult);

      const linkFile = await createExcelFile(startTime, endTime, dataHandleResult);

      return res.status(SUCCESS_200.code).json({ linkFile: linkFile });
    }

    const recordResult = await recordingRepository.findAndCount({
      where: {
        origTime: Between(Number(startTimeMilisecond), Number(endTimeMilisecond)),
        ...query
      },
      skip: offset,
      take: limit
    });

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: recordResult && recordResult[1] ? recordResult[1] : 0,
    });

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: recordResult && recordResult[0] && recordResult.length > 0 ? handleData(recordResult[0]) : [],
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

    return el;
  });

  return newData;
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