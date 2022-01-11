
const { getRepository, getConnection } = require('typeorm');
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
    const recordingRepository = getRepository(CallDetailRecording);

    const [data, count] = await Promise.all([
      recordingRepository.createQueryBuilder('call_detail_records').offset(0).limit(10).getMany(),
      recordingRepository.createQueryBuilder('call_detail_records').getCount()
    ]);

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: data,
      total: count
    });
  } catch (error) {
    console.log(`------- error ------- getRecording`);
    console.log(error);
    console.log(`------- error ------- getRecording`);

    return res.status(ERR_500.code).json({ message: 'Có lỗi, vui lòng thử lại!' });
  }
}