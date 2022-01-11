
const pagesModel = require('../models/pagesModel');
const {
  SUCCESS_200,
  ERR_400,
  ERR_404,
} = require("../helpers/constants/statusCodeHTTP");

const { PAGES_COLLECTION } = process.env;

exports.index = async (req, res, next) => {
  try {
    let mongoDB = req.app.locals.mongoDB;

    let result = await pagesModel.getAll(mongoDB, PAGES_COLLECTION, req.query);

    res.render('pages/index', {
      page: 'manage-pages/index',
      title: 'Quản lý trang',
      titlePage: 'Quản lí page',
      data: result.data,
      count: result.count,
      pageNumber: result.page,
      chatEntryPoinID: _config.entryPoint,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    next(error);
  }
}

exports.renderCreate = (req, res, next) => {
  try {
    res.render('pages/index', {
      page: 'manage-pages/create',
      title: 'Tạo trang mới',
      titlePage: 'Tạo page mới',
      chatEntryPoinID: _config.entryPoint,
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    next(error);
  }
}

exports.renderEdit = async (req, res, next) => {
  try {
    const mongoDB = req.app.locals.mongoDB;

    if (!req.params.id) {
      throw new Error();
    }

    let id = req.params.id;

    let result = await pagesModel.getByID(mongoDB, PAGES_COLLECTION, id);

    res.render('pages/index', {
      page: 'manage-pages/edit',
      title: 'Sửa trang',
      titlePage: 'Sửa page',
      data: result,
      chatEntryPoinID: _config.entryPoint,
    })
  } catch (error) {
    console.log(`begin ------- error ------- `);
    console.log(error);
    console.log(`end ------- error ------- `);
    return next(error);
  }
}

exports.create = async (req, res, next) => {
  try {
    let mongoDB = req.app.locals.mongoDB;
    if (
      !req.body.pageID
      || !req.body.pageName
      || !req.body.chatEntryPointId
      || !req.body.access_token
      || !req.body.welcome
      || !req.body.goodbye
    ) {
      throw new Error();
    }

    await pagesModel.create(mongoDB, PAGES_COLLECTION, req.body);

    return res.status(SUCCESS_200.code).json({ data: req.body, message: 'Thêm thành công!' });
  } catch (error) {
    console.log(`begin ------- error ------- createNewPages`);
    console.log(error);
    console.log(`end ------- error ------- createNewPages`);
    return res.status(ERR_404.code).json({ message: 'Có lỗi, vui lòng thử lại!' });
  }
}

exports.updateByID = async (req, res, next) => {
  try {
    let mongoDB = req.app.locals.mongoDB;

    if (
      !req.body.data.pageID
      || !req.body.data.pageName
      || !req.body.data.chatEntryPointId
      || !req.body.data.access_token
      || !req.body.data.welcome
      || !req.body.data.goodbye
    ) {
      throw new Error();
    }

    await pagesModel.updateByID(mongoDB, PAGES_COLLECTION, req.body._id, req.body.data);

    return res.status(200).json({ data: req.body, message: 'Cập nhật thành công!' });
  } catch (error) {
    console.log(`begin ------- error ------- `);
    console.log(error);
    console.log(`end ------- error ------- `);
    return res.status(ERR_404.code).json({ message: 'Có lỗi, vui lòng thử lại!' });
  }
}

exports.changeActive = async (req, res, next) => {
  try {
    let mongoDB = req.app.locals.mongoDB;

    await pagesModel.changeActive(mongoDB, PAGES_COLLECTION, req.body);

    return res.status(200).json({ data: req.body, message: 'Thay đổi thành công!' });
  } catch (error) {
    console.log(`begin ------- error ------- `);
    console.log(error);
    console.log(`end ------- error ------- `);
    return res.status(ERR_404.code).json({ message: 'Có lỗi, vui lòng thử lại!' });
  }
}

exports.deleteByID = async (req, res, next) => {
  try {
    const mongoDB = req.app.locals.mongoDB;

    if (!req.body.id) {
      throw new Error();
    }

    const id = req.body.id;

    const result = await pagesModel.deleteByID(mongoDB, PAGES_COLLECTION, id);

    return res.status(200).json({ data: result.value, message: 'Xóa thành công!' });
  } catch (error) {
    console.log(`begin ------- error ------- `);
    console.log(error);
    console.log(`end ------- error ------- `);
    return res.status(ERR_404.code).json({ message: 'Có lỗi, vui lòng thử lại!' });
  }
}

exports.asyncData = async (req, res, next) => {
  try {
    const mongoDB = req.app.locals.mongoDB;

    const result = await pagesModel.getPagesActive(mongoDB, PAGES_COLLECTION);

    _io.sockets.emit('SYNC_DATA_CONFIG', JSON.stringify(result));

    return res.status(200).json({ data: result.value, message: 'Đồng bộ thành công!' });
  } catch (error) {
    console.log(`begin ------- error ------- `);
    console.log(error);
    console.log(`end ------- error ------- `);
    return res.status(ERR_404.code).json({ message: 'Có lỗi, vui lòng thử lại!' });
  }
}