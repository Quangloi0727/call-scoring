
const { getRepository, getConnection } = require('typeorm');
const pagination = require('pagination');
const CallDetailRecording = require('../entities/CallDetailRecordSchema');
const pagesModel = require('../models/pagesModel');
const {
  SUCCESS_200,
  ERR_400,
  ERR_404,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");

const { PAGES_COLLECTION } = process.env;

exports.index = async (req, res, next) => {
  try {
    return res.render('pages/index', {
      page: 'recording/index',
      title: 'Danh sách cuộc gọi',
      titlePage: 'Danh sách cuộc gọi',
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
    const {page} = req.query;
    const limit = 25;
    const pageNumber = page ? Number(page) : 1;
    const offset = pageNumber > 1 ? pageNumber * limit : 0;
    const recordingRepository = getRepository(CallDetailRecording);

    const recordResuld = await recordingRepository.findAndCount({skip: offset,take: limit});

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: recordResuld && recordResuld[1] ? recordResuld[1] : 0,
    });

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: recordResuld && recordResuld[0] && recordResuld.length > 0 ? recordResuld[0] : [],
      paging: paginator.getPaginationData()
    });
  } catch (error) {
    console.log(`------- error ------- getRecording`);
    console.log(error);
    console.log(`------- error ------- getRecording`);

    return res.status(ERR_500.code).json({ message: 'Có lỗi, vui lòng thử lại!' });
  }
}