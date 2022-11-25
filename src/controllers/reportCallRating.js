const titlePage = 'Báo cáo chấm điểm cuộc gọi'
const {
  STATUS,
  USER_ROLE,
  TeamStatus,
  SOURCE_NAME,
  CONST_STATUS,
  constTypeResultCallRating
} = require('../helpers/constants/index')
const { Op } = require('sequelize')
const model = require('../models')
const pagination = require('pagination')
const { SUCCESS_200, ERR_400 } = require("../helpers/constants/statusCodeHTTP")
const { default: async } = require('async')
const moment = require('moment')
exports.index = async (req, res, next) => {
  try {
    const evaluators = await getUserByRole(USER_ROLE.evaluator.n)
    const agents = await getUserByRole(USER_ROLE.agent.n)
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
      scoreScripts,
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
      gradingDate, // ngày chấm điểm
      idAgent,
      idEvaluator,
      idScoreScript,
      idScoreTarget,
      idTeam,
      oriDate,  // thời gian thực hiện cuộc gọi
      sourceType
    } = req.query

    if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

    limit = Number(limit)

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * limit) - limit


    // lấy dữ liệu tổng hợp 
    const [countCallShare, countCallReviewed, CallRatingHistory, percentTypeCallRating, callDetailRecords] =
      await getSummaryData(gradingDate, idAgent, idEvaluator, idScoreScript, idScoreTarget, idTeam, oriDate, sourceType)

    const CallShareDetail = await model.CallShare.findAll({
      // where: queryAssignFor,
      include: [
        {
          model: model.CallDetailRecords,
          as: 'callInfo',
          include: [
            {
              model: model.Team,
              as: 'team'
            },
            {
              model: model.User,
              as: 'agent'
            }
          ]
        },
        {
          model: model.ScoreTarget,
          as: 'scoreTargetInfo'
        },
        {
          model: model.ScoreScript,
          as: 'scoreScriptInfo'
        },
        {
          model: model.CallRating,
          as: 'callRatingInfo',
          include: {
            model: model.SelectionCriteria,
            as: 'selectionCriteriaInfo'
          }
        }
      ],
      order: [['id']],
      offset: offset,
      limit: limit
    })

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: countCallShare
    })

    return res.json({
      code: SUCCESS_200.code,
      countCallShare: countCallShare,
      callRatingHistory: CallRatingHistory,
      countCallReviewed: countCallReviewed,
      percentTypeCallRating: percentTypeCallRating,
      callDetailRecords: callDetailRecords,
      callShareDetail: CallShareDetail,
      constTypeResultCallRating: constTypeResultCallRating,
      paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
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

async function getSummaryData(gradingDate, idAgent, idEvaluator, idScoreScript, idScoreTarget, idTeam, oriDate, sourceType) {
  let whereCallInfo = {}

  if (oriDate) {
    let stringDate = oriDate.split(' - ')
    let _where = {
      [Op.and]: [
        { oriDate: { [Op.gte]: moment(stringDate[0], "DD/MM/YYYY").endOf('day') } },
        { oriDate: { [Op.lte]: moment(stringDate[1], "DD/MM/YYYY").endOf('day') } },
      ]
    }

    whereCallInfo = Object.assign(whereCallInfo, _where)
  }

  if (idAgent) {
    whereCallInfo.agentId = {
      [Op.in]: idAgent
    }
  }

  if (idTeam) {
    whereCallInfo.teamId = {
      [Op.in]: idTeam
    }
  }

  if (sourceType) {
    whereCallInfo.sourceType = {
      [Op.in]: sourceType
    }
  }


  let whereCallShare = {}
  if (gradingDate) {
    let stringDate = gradingDate.split(' - ')
    let _where = {
      [Op.and]: [
        { reviewedAt: { [Op.gte]: moment(stringDate[0], "DD/MM/YYYY").startOf('day') } },
        { reviewedAt: { [Op.lte]: moment(stringDate[1], "DD/MM/YYYY").endOf('day') } },
      ]
    }

    whereCallShare = Object.assign(whereCallShare, _where)
  }

  if (idEvaluator) {
    whereCallShare.idUserReview = {
      [Op.in]: idEvaluator
    }
  }

  if (idScoreScript) {
    whereCallShare.idScoreScript = {
      [Op.in]: idScoreScript
    }
  }

  if (idScoreTarget) {
    whereCallShare.scoreTargetId = {
      [Op.in]: idScoreTarget
    }
  }

  return await Promise.all([
    // lấy tổng số cuộc gọi đã phân công
    model.CallShare.count({
      where: whereCallShare,
      include: [{
        model: model.CallDetailRecords,
        as: 'callInfo',
        where: whereCallInfo
      }],
      raw: true
    }),

    // tổng cuộc gọi đã được chấm điểm
    model.CallShare.count({
      where: Object.assign(whereCallShare, { pointResultCallRating: { [Op.ne]: null } }),
      raw: true
    }),

    //tổng cuộc đã chấm lại 
    model.CallRatingHistory.findAll({
      attributes: [
        'callId',
        [model.Sequelize.literal(`CASE WHEN COUNT(1) > 1 THEN 1 ELSE 0 END`), 're_scored']
      ],
      group: ['callId'],
      raw: true
    }),

    //dữ liệu chấm điểm theo loại đánh giá
    model.CallShare.findAll({
      where: Object.assign(whereCallShare, { pointResultCallRating: { [Op.ne]: null } }),
      attributes: [
        ['typeResultCallRating', 'name'],
        [model.Sequelize.literal(`COUNT(1)`), 'y']
      ],
      group: ['typeResultCallRating'],
      raw: true
    }),

    // tổng cuộc gọi có trong hệ thống
    model.CallDetailRecords.findAll({
      attributes: [
        [model.Sequelize.literal(`COUNT(1)`), 'CallDetailRecords'],
      ],
      raw: true
    })

  ])
}
