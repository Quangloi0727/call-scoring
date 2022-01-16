const { Op } = require('sequelize');
const pagination = require('pagination');
const moment = require('moment');
const UserModel = require('../models/user');
const {
  SUCCESS_200,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");

const titlePage = 'Danh sách người dùng';

exports.index = async (req, res, next) => {
  try {
    return res.render('pages/index', {
      page: 'users/index',
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

exports.getUsers = async (req, res, next) => {
  try {
    const { page, extension, username, fullname } = req.query;
    const limit = 25;
    const pageNumber = page ? Number(page) : 1;
    const offset = (pageNumber * limit) - limit;
    let query = {};

    if (username) query.userName = { [Op.substring]: username };
    if (fullname) query.fullName = { [Op.substring]: fullname };
    if (extension) query.extension = { [Op.substring]: extension };

    const [recordResult, total] = await Promise.all([
      UserModel.findAll({
        where: {
          ...query,
          [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
        },
        order: [['id', 'DESC']],
        offset: offset,
        limit: limit,
        include: [{ model: UserModel, as: 'userCreate' }]
      }),
      UserModel.count({
        where: {
          ...query,
          [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
        },
      })
    ]);

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: total || 0,
    });

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: recordResult || [],
      paginator: paginator.getPaginationData(),
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.createUser = async (req, res, next) => {
  try {
    const data = req.body

    if (data.password !== data.repeat_password) {
      throw new Error('Mật khẩu không trùng khớp!');
    }

    data.fullName = `${data.firstName} ${data.lastName}`;
    data.extension = Number(data.extension);
    data.role = 0;
    data.created = req.user.id;
    data.createAt = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');
    data.updatedAt = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');

    await UserModel.create(data);

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