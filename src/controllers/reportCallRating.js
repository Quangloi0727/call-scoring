const titlePage = 'Báo cáo chấm điểm cuộc gọi'
const {
  TypeDateSaveForCall,
  UnlimitedSaveForCall,
  STATUS,
  dataRetentionPolicyNotFound,
  statusUpdateFail,
  statusUpdateSuccess,
  deleteSuccess,
  MESSAGE_ERROR,
  TeamStatus
} = require('../helpers/constants/index')
const { Op } = require('sequelize')
const model = require('../models')
const pagination = require('pagination')
const { SUCCESS_200, ERR_400 } = require("../helpers/constants/statusCodeHTTP")


exports.index = async (req, res, next) => {
  try {

    return _render(req, res, 'reportCallRating/index', {
      title: titlePage,
      titlePage: titlePage,
      STATUS
    })

  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}
