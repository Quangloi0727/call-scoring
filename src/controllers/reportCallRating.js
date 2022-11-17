const titlePage = 'Báo cáo chấm điểm cuộc gọi'
const {
  STATUS,
  USER_ROLE,
  TeamStatus,
  SOURCE_NAME,
  CONST_STATUS
} = require('../helpers/constants/index')
const { Op } = require('sequelize')
const model = require('../models')
const pagination = require('pagination')
const { SUCCESS_200, ERR_400 } = require("../helpers/constants/statusCodeHTTP")
const { default: async } = require('async')

exports.index = async (req, res, next) => {
  try {
    const evaluators = await getUserByRole(USER_ROLE.evaluator.n);
    const agents = await getUserByRole(USER_ROLE.agent.n);
    const groups = await model.Group.findAll({})
    const teams = await model.Team.findAll({
      where: {
        status: TeamStatus.ON
      }
    })

    const scoreTargets = await model.ScoreTarget.findAll({
      where: {
        status: { [Op.ne]: CONST_STATUS.DRAFT.value }
      },
      attributes: ['id', 'name'],
    })
    const scoreScripts = await model.ScoreScript.findAll({
      where: {
        status: { [Op.ne]: CONST_STATUS.DRAFT.value }
      },
      attributes: ['id', 'name'],
    })
    return _render(req, res, 'reportCallRating/index', {
      title: titlePage,
      titlePage: titlePage,
      STATUS,
      evaluators,
      agents,
      groups,
      teams,
      SOURCE_NAME,
      scoreTargets,
      scoreScripts
    })

  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.queryReport = async (req, res) => {
  try {

    let {
      page,
      limit,
      query
    } = req.query

    if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

    limit = Number(limit)

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * limit) - limit

    const [countCallShare, callRatingGroupByCallId, callRatingHistoryGroupByCallId] = await Promise.all([
      model.CallShare.count({
      }),
      model.CallRating.findAll({
        group: ['callId']
      }),
      model.CallRatingHistory.findAll({
        group: ['callId']
      }),
    ])


    return res.json({
      code: SUCCESS_200.code,
      countCallShare: countCallShare,
      countCallRatingGroupByCallId: callRatingGroupByCallId.length,
      countCallRatingHistoryGroupByCallId: callRatingHistoryGroupByCallId.length
    })

  } catch (error) {
    _logger.error(titlePage + " - chấm điểm", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

function getUserByRole(idRole) {
  return model.User.findAll({
    where: { isActive: 1 },
    attributes: ['id', 'fullName', 'userName'],
    include: [{
      model: model.UserRole,
      as: 'roles',
      where: {
        role: idRole
      },
      attributes: ['id', 'userId']
    }]
  })
}
