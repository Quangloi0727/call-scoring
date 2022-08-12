const { Op, QueryTypes } = require('sequelize')
const pagination = require('pagination')

const titlePage = 'Mục tiêu chấm điểm'
const {
  SUCCESS_200,
  ERR_500,
  ERR_400,
  ERR_403
} = require("../helpers/constants/statusCodeHTTP")
const SOURCE_NAME = {
  oreka: {
    code: 'ORK',
    text: 'Orec'
  },
  fs: {
    code: 'FS',
    text: 'Freeswitch'
  },
}

const model = require('../models')
const moment = require('moment')
const {
  headerDefault,
  CONST_RATING_BY,
  CONST_CALL_TYPE,
  CONST_EFFECTIVE_TIME_TYPE,
  CONST_STATUS,
  CONST_DATA,
  CONST_COND } = require('../helpers/constants/index')
exports.index = async (req, res, next) => {
  try {
    return _render(req, res, 'scoreTarget/index', {
      title: titlePage,
      titlePage: titlePage,
      CONST_STATUS,
      headerDefault: headerDefault
    })
  } catch (error) {
    console.log(`------- error scoreTargetController index ------- `)
    console.log(error)
    return next(error)
  }
}

exports.new = async (req, res, next) => {
  try {

    const scoreScript = await model.ScoreScript.findAll({
      where: { status: 1 },
      attributes: ['name', 'id'],
      raw: true,
      nest: true
    })
    return _render(req, res, 'scoreTarget/newTarget', {
      titlePage: null,
      scoreScript: scoreScript.length > 0 ? scoreScript : [],
      CONST_RATING_BY,
      CONST_CALL_TYPE,
      CONST_EFFECTIVE_TIME_TYPE,
      CONST_STATUS,
      CONST_DATA,
      CONST_COND
    })

  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.gets = async (req, res, next) => {
  try {
    const { page, name, status } = req.query
    let { limit } = req.query
    if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

    limit = Number(limit)

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * limit) - limit
    let query = {}

    if (name) {
      query.name = {
        [Op.like]: name + '%'
      }
    }
    if (status || status == "0") {
      query.status = status
    }

    const { count, rows } = await model.ScoreTarget.findAndCountAll({
      where: query ? query : {},
      include: [
        { model: model.User, as: 'userCreate' },
        { model: model.User, as: 'userUpdate' },
        { model: model.ScoreScript, as: 'scoreScript' },
      ],
      required: false,
      offset: offset,
      limit: limit,
      raw: true,
      nest: true
    })

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: count,
    })

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: rows || [],
      paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return res.status(ERR_500.code).json({ message: error.message })
  }
}
exports.create = async (req, res, next) => {
  console.log(req)
  let transaction

  try {

    const data = req.body
    transaction = await model.sequelize.transaction()

    if (data.callTime) {
      let string = data.callTime.split('-')
    }
    if (data.name) {
      let foundUser = await model.ScoreTarget.findOne({ where: { name: data.name.toLowerCase(), status: 1 } })
      if (foundUser) return res.status(ERR_400.code).json({
        message: 'Tên mục tiêu đã được sử dụng!',
      })
    }

    data.created = req.user.id
    data.createdAt = new Date()

    let userUpdate = await model.ScoreTarget.create(data, { transaction: transaction })
    await transaction.commit()
    return res.status(SUCCESS_200.code).json({ message: userUpdate })
  } catch (error) {
    console.log('Tạo mục tiêu bị lỗi', error)
    if (transaction) await transaction.rollback()
    return res.status(ERR_500.code).json({ message: error.message })
  }
}