const { Op } = require('sequelize');
const pagination = require('pagination');
const moment = require('moment');
const UserModel = require('../models/user');
const GroupModel = require('../models/group');
const {
  SUCCESS_200,
  ERR_500
} = require("../helpers/constants/statusCodeHTTP");

const titlePage = 'Danh sách nhóm';

exports.index = async (req, res, next) => {
  try {
    return res.render('pages/index', {
      page: 'groups/index',
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

exports.getGroups = async (req, res, next) => {
  try {
    const { page, name } = req.query;
    const limit = 10;
    const pageNumber = page ? Number(page) : 1;
    const offset = (pageNumber * limit) - limit;
    let query = {};

    const [groupsResult, total] = await Promise.all([
      GroupModel.findAll({
        where: {
          ...query,
        },
        order: [['id', 'DESC']],
        offset: offset,
        limit: limit,
        include: [{ model: UserModel, as: 'userCreate' }]
      }),
      GroupModel.count({
        where: {
          ...query,
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
      data: groupsResult || [],
      paginator: paginator.getPaginationData(),
    });
  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return res.status(ERR_500.code).json({ message: error.message });
  }
}

exports.createGroup = async (req, res) => {
  try {
    const data = req.body

    data.created = req.user.id;

    await GroupModel.create(data);

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