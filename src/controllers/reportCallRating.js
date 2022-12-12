const titlePage = 'Báo cáo chấm điểm cuộc gọi'
const {
  STATUS,
  USER_ROLE,
  TeamStatus,
  SOURCE_NAME,
  CONST_STATUS,
  constTypeResultCallRating,
  headerReportCallRating,
} = require('../helpers/constants/index')
const { Op } = require('sequelize')
const model = require('../models')
const pagination = require('pagination')
const { SUCCESS_200, ERR_400 } = require("../helpers/constants/statusCodeHTTP")
const { createExcelPromise } = require('../common/createExcel')
const CallRating = require('../models/callRating')

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
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name'],
    })
    return _render(req, res, 'reportCallRating/index', {
      title: titlePage,
      titlePage: titlePage,
      STATUS,
      evaluators: evaluators || [],
      agents: agents || [],
      groups: groups || [],
      teams: teams || [],
      SOURCE_NAME,
      scoreTargets: scoreTargets || [],
      scoreScripts: scoreScripts || [],
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
    } = req.query

    if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

    limit = Number(limit)

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * limit) - limit

    // lấy dữ liệu tổng hợp 
    const [countCallShare, countCallReviewed, CallRatingReScore, percentTypeCallRating, totalCall] =
      await getSummaryData(whereCallInfo(req.query), whereCallShare(req.query))

    const CallShareDetail = await queryCallShareDetail(req.query, limit, offset)

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: countCallShare
    })

    return res.json({
      code: SUCCESS_200.code,
      countCallShare: countCallShare,
      callRatingReScore: CallRatingReScore,
      countCallReviewed: countCallReviewed,
      percentTypeCallRating: percentTypeCallRating,
      totalCall: totalCall,
      callShareDetail: CallShareDetail,
      constTypeResultCallRating: constTypeResultCallRating,
      paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
    })

  } catch (error) {
    _logger.error(titlePage + " - truy vấn chấm điểm", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.queryReportByScoreScript = async (req, res) => {
  try {
    let {
      page,
      limit,
      idScoreScript,
    } = req.query

    if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

    limit = Number(limit)

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * limit) - limit

    const countCallShare = await model.CallShare.count({
      where: whereCallShare(req.query),
      include: [{
        model: model.CallDetailRecords,
        as: 'callInfo',
        where: whereCallInfo(req.query)
      }],
      raw: true
    })
    const CallShareDetail = await queryCallShareDetail(req.query, limit, offset)

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: countCallShare
    })

    const countCallReviewed = await model.CallShare.count({
      where: Object.assign({
        isMark: true,
        idScoreScript: idScoreScript
      }, whereCallShare(req.query))
    })

    // tính điểm trung bình theo kịch bản
    const avgPointByCall = await model.CallShare.findAll({
      where: Object.assign({
        isMark: true,
        idScoreScript: idScoreScript
      }, whereCallShare(req.query)),
      attributes: [
        [model.sequelize.fn('AVG', model.sequelize.col('pointResultCallRating')), 'avgPoint'],
      ],
      raw: true
    })

    const sumScoreMax = await getSumScoreMax(idScoreScript)

    const unScoreCriteriaGroup = await getUnScore('unScoreCriteriaGroup', idScoreScript)

    const unScoreScript = await getUnScore('unScoreScript', idScoreScript)

    //dữ liệu chấm điểm theo loại đánh giá
    const percentTypeCallRating = await model.CallShare.findAll({
      where: {
        isMark: true,
        idScoreScript: idScoreScript
      },
      attributes: [
        ['typeResultCallRating', 'name'],
        [model.Sequelize.literal(`COUNT(1)`), 'y']
      ],
      group: ['typeResultCallRating'],
      raw: true
    })

    const detailScoreScript = await model.ScoreScript.findOne({
      where: { id: idScoreScript },
      include: [{
        model: model.CriteriaGroup,
        as: 'CriteriaGroup',
        include: [{
          model: model.Criteria,
          as: 'Criteria',
          include: [{
            model: model.SelectionCriteria,
            as: 'SelectionCriteria',
          }],
        }]
      }]
    })

    return res.json({
      code: SUCCESS_200.code,
      countCallReviewed: countCallReviewed,
      avgPointByCall: avgPointByCall,
      sumScoreMax: sumScoreMax,
      unScoreCriteriaGroup: unScoreCriteriaGroup.length || 0,
      unScoreScript: unScoreScript.length || 0,
      percentTypeCallRating: percentTypeCallRating,
      constTypeResultCallRating: constTypeResultCallRating,
      callShareDetail: CallShareDetail,
      detailScoreScript: detailScoreScript,
      paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
    })
  } catch (error) {
    _logger.error(titlePage + " - truy vấn chấm điểm", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.getCriteriaGroup = async (req, res) => {
  try {
    const scoreScriptId = req.query.scoreScriptId.split(",")
    return res.json({
      code: SUCCESS_200.code,
      criteriaGroup: await model.CriteriaGroup.findAll({ where: { scoreScriptId: { [Op.in]: scoreScriptId } } })
    })
  } catch (error) {
    _logger.error(titlePage + " - Lấy nhóm tiêu chí lỗi", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.getCriteria = async (req, res) => {
  try {
    const criteriaGroupId = req.query.criteriaGroupId.split(",")
    return res.json({
      code: SUCCESS_200.code,
      criteria: await model.Criteria.findAll({ where: { criteriaGroupId: { [Op.in]: criteriaGroupId } } })
    })
  } catch (error) {
    _logger.error(titlePage + " - Lấy tiêu chí lỗi", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.getPercentSelectionCriteria = async (req, res) => {
  try {

    // const { criteriaGroupId, idCriteria, idScoreScript } = req.query
    const idScoreScript = req.query.idScoreScript
    const criteriaGroupId = req.query.criteriaGroupId
    const idCriteria = req.query.idCriteria

    const selectionCriteria = await model.ScoreScript.findAll({
      where: { id: idScoreScript },
      include: [{
        model: model.CriteriaGroup,
        as: 'CriteriaGroup',
        where: { id: criteriaGroupId },
        include: [{
          model: model.Criteria,
          as: 'Criteria',
          where: { id: idCriteria },
          include: [{
            model: model.SelectionCriteria,
            as: 'SelectionCriteria',
          }],
        }]
      }],
      raw: true
    })


    let percentSelectionCriteria = await model.CallRating.findAll({
      where: { idSelectionCriteria: { [Op.in]: _.pluck(selectionCriteria, 'CriteriaGroup.Criteria.SelectionCriteria.id') } },
      include: [{
        model: model.SelectionCriteria,
        as: 'selectionCriteriaInfo',
        attributes: ['name']
      }],
      attributes: [
        ['idSelectionCriteria', 'idSelectionCriteria'],
        [model.Sequelize.literal(`COUNT(1)`), 'y']
      ],
      group: ['selectionCriteriaInfo.name', 'idSelectionCriteria'],
      raw: true
    })

    if (percentSelectionCriteria) {
      percentSelectionCriteria.map((el) => {
        el.name = el['selectionCriteriaInfo.name']
        delete el.idSelectionCriteria
        delete el['selectionCriteriaInfo.name']
      })
    }
    return res.json({
      code: SUCCESS_200.code,
      percentSelectionCriteria: percentSelectionCriteria
    })
  } catch (error) {
    _logger.error(titlePage + " - Lấy tiêu chí lỗi", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.exportExcelData = async (req, res) => {
  try {
    const callShareDetail = await queryCallShareDetail(req.query)
    let titleExcel = {}
    let dataHeader = {}

    for (const [key, value] of Object.entries(headerReportCallRating)) {
      titleExcel[`TXT_${key.toUpperCase()}`] = value
      dataHeader[`TXT_${key.toUpperCase()}`] = key
    }


    let newData = callShareDetail.map((item) => {
      return {
        ...item,
        callId: item.callInfo.id || '',
        direction: item.callInfo.direction || '',
        agentName: item.callInfo.agent ? item.callInfo.agent.name : '',
        teamName: item.callInfo.team ? item.callInfo.team.name : '',
        groupName: '',
        scoreTarget: item.scoreTargetInfo ? item.scoreTargetInfo.name : '',
        scoreScriptAuto: '',
        scoreScript: item.scoreScriptInfo ? item.scoreScriptInfo.name : '',
        scoreScriptHandle: item.pointResultCallRating ? item.pointResultCallRating : '',
        scoreScriptResult: item.typeResultCallRating ? constTypeResultCallRating[`point${item.typeResultCallRating}`].txt : '',
        userReview: item.userReview ? item.userReview.fullName + ' ' + `(${item.userReview.userName})` : '',
        reviewedAt: item.reviewedAt ? _moment(item.reviewedAt, "HH:mm:ss DD/MM/YYYY").format('DD/MM/YYYY HH:mm:ss') : '',
      }
    })
    const linkFile = await createExcelFile(newData, titleExcel, dataHeader)
    return res.json({
      code: SUCCESS_200.code,
      linkFile: linkFile
    })
  } catch (error) {
    _logger.error(titlePage + " - Xuất excel lỗi", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}


exports.exportExcelDataByScoreScript = async (req, res) => {
  try {
    const callShareDetail = await queryCallShareDetail(req.query)
    const detailScoreScript = await model.ScoreScript.findOne({
      where: { id: { [Op.in]: req.query.idScoreScript } },
      include: [{
        model: model.CriteriaGroup,
        as: 'CriteriaGroup',
        include: [{
          model: model.Criteria,
          as: 'Criteria',
          include: [{
            model: model.SelectionCriteria,
            as: 'SelectionCriteria',
          }],
        }]
      }]
    })

    let titleExcel = {}
    let dataHeader = {}

    for (const [key, value] of Object.entries(headerReportCallRating)) {
      titleExcel[`TXT_${key.toUpperCase()}`] = value
      dataHeader[`TXT_${key.toUpperCase()}`] = key
    }

    callShareDetail.map((callShare) => {
      // callShare.callRatingInfo.map((callRating) => {
      //   console.log(callRating)
      // })
      detailScoreScript.CriteriaGroup.map((CriteriaGroup) => {
        let resultScoreCriteriaGroup = 0
        let scoreMax = 0
        let criteriaGroup = {}
        let criteria = {}
        let checkIsUnScoreCriteriaGroup = false
        let tempTitleExcel = {}
        let tempDataHeader = {}
        CriteriaGroup.Criteria.map((Criteria) => {
          scoreMax += Criteria.scoreMax
          const found = callShare.callRatingInfo.find(element => element.idCriteria == Criteria.id)
          if (found) {
            if (found.selectionCriteriaInfo.unScoreCriteriaGroup) checkIsUnScoreCriteriaGroup = true
            resultScoreCriteriaGroup += found.selectionCriteriaInfo.score
          }
          criteria[`criteria_${Criteria.id}`] = `${found.selectionCriteriaInfo.score} - ${((found.selectionCriteriaInfo.score / Criteria.scoreMax) * 100).toFixed(0) + '%'}`
          tempTitleExcel[`TXT_${`criteria_${Criteria.id}`.toUpperCase()}`] = Criteria.name
          tempDataHeader[`TXT_${`criteria_${Criteria.id}`.toUpperCase()}`] = `criteria_${Criteria.id}`
        })
        if (checkIsUnScoreCriteriaGroup) {
          resultScoreCriteriaGroup = 0
        }

        criteriaGroup[`criteriaGroup_${CriteriaGroup.id}`] = `${resultScoreCriteriaGroup} - ${((resultScoreCriteriaGroup / scoreMax) * 100).toFixed(0) + '%'}`
        titleExcel[`TXT_${`criteriaGroup_${CriteriaGroup.id}`.toUpperCase()}`] = CriteriaGroup.name
        dataHeader[`TXT_${`criteriaGroup_${CriteriaGroup.id}`.toUpperCase()}`] = `criteriaGroup_${CriteriaGroup.id}`

        Object.assign(titleExcel, tempTitleExcel)
        Object.assign(dataHeader, tempDataHeader)

        Object.assign(criteriaGroup, criteria)
        Object.assign(callShare, criteriaGroup)

      })

      return {
        ...callShare,
        callId: callShare.callInfo.id || '',
        direction: callShare.callInfo.direction || '',
        agentName: callShare.callInfo.agent ? callShare.callInfo.agent.name : '',
        teamName: callShare.callInfo.team ? callShare.callInfo.team.name : '',
        groupName: '',
        scoreTarget: callShare.scoreTargetInfo ? callShare.scoreTargetInfo.name : '',
        scoreScriptAuto: '',
        scoreScript: callShare.scoreScriptInfo ? callShare.scoreScriptInfo.name : '',
        scoreScriptHandle: callShare.pointResultCallRating ? callShare.pointResultCallRating : '',
        scoreScriptResult: callShare.typeResultCallRating ? constTypeResultCallRating[`point${callShare.typeResultCallRating}`].txt : '',
        userReview: callShare.userReview ? callShare.userReview.fullName + ' ' + `(${callShare.userReview.userName})` : '',
        reviewedAt: callShare.reviewedAt ? _moment(callShare.reviewedAt, "HH:mm:ss DD/MM/YYYY").format('DD/MM/YYYY HH:mm:ss') : '',
      }
    })

    const linkFile = await createExcelFile(callShareDetail, titleExcel, dataHeader)
    return res.json({
      code: SUCCESS_200.code,
      linkFile: linkFile
    })
  } catch (error) {
    _logger.error(titlePage + " - Xuất excel lỗi", error)
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

async function getSummaryData(whereCallInfo, whereCallShare) {
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
      where: Object.assign({ pointResultCallRating: { [Op.ne]: null } }, whereCallShare),
      raw: true
    }),

    //tổng cuộc đã chấm lại 
    model.CallShare.count({
      where: Object.assign(
        { pointResultCallRating: { [Op.ne]: null } },
        { updateReviewedAt: { [Op.gt]: model.sequelize.col('reviewedAt') } },
        whereCallShare
      ),
      raw: true
    }),

    //dữ liệu chấm điểm theo loại đánh giá
    model.CallShare.findAll({
      where: Object.assign({ pointResultCallRating: { [Op.ne]: null } }, whereCallShare),
      attributes: [
        ['typeResultCallRating', 'name'],
        [model.Sequelize.literal(`COUNT(1)`), 'y']
      ],
      group: ['typeResultCallRating'],
      raw: true
    }),

    // tổng cuộc gọi có trong hệ thống
    model.CallDetailRecords.count({
      where: whereCallInfo,
      raw: true
    })

  ])
}


// func tạo bộ lọc cho model callShare
function whereCallShare(query) {
  let whereCallShare = {}
  if (query.gradingDate) {
    let stringDate = query.gradingDate.split(' - ')
    let _where = {
      [Op.and]: [
        { reviewedAt: { [Op.gte]: _moment(stringDate[0], "DD/MM/YYYY").startOf('day').format('YYYY-MM-DD HH:mm:ss') } },
        { reviewedAt: { [Op.lte]: _moment(stringDate[1], "DD/MM/YYYY").endOf('day').format('YYYY-MM-DD HH:mm:ss') } },
      ]
    }

    whereCallShare = Object.assign(whereCallShare, _where)
  }

  if (query.idEvaluator) {
    whereCallShare.idUserReview = {
      [Op.in]: query.idEvaluator
    }
  }

  if (query.idScoreScript) {
    const OpTypes = typeof query.idScoreScript == 'string' ? 'eq' : 'in'
    whereCallShare.idScoreScript = {
      [Op[OpTypes]]: query.idScoreScript
    }
  }

  if (query.idScoreTarget) {
    whereCallShare.scoreTargetId = {
      [Op.in]: query.idScoreTarget
    }
  }
  return whereCallShare
}

// func tạo bộ lọc cho model CallDetailRecords
function whereCallInfo(query) {
  let whereCallInfo = {}

  if (query.oriDate) {
    let stringDate = query.oriDate.split(' - ')
    let _where = {
      [Op.and]: [
        { oriDate: { [Op.gte]: _moment(stringDate[0], "DD/MM/YYYY").endOf('day').format('YYYY-MM-DD HH:mm:ss') } },
        { oriDate: { [Op.lte]: _moment(stringDate[1], "DD/MM/YYYY").endOf('day'.format('YYYY-MM-DD HH:mm:ss')) } },
      ]
    }

    whereCallInfo = Object.assign(whereCallInfo, _where)
  }

  if (query.idAgent) {
    whereCallInfo.agentId = {
      [Op.in]: query.idAgent
    }
  }

  if (query.idTeam) {
    whereCallInfo.teamId = {
      [Op.in]: query.idTeam
    }
  }

  if (query.sourceType) {
    whereCallInfo.sourceType = {
      [Op.in]: query.sourceType
    }
  }

  return whereCallInfo
}

/**
 * Tổng cuộc gọi bị liệt kịch bản hoặc liệt nhóm tiêu chí
 * @param {String} typeUnScore loại điểm liệt: Liệt kịch bản - Liệt tiêu chí
 *  @param {String} idScoreScript id của kịch bản chấm điểm
 */
async function getUnScore(typeUnScore, idScoreScript) {
  try {
    let where = {}

    // check cuộc gọi điều kiện liệt theo kịch bản
    if (typeUnScore == 'unScoreScript') {
      where = { unScoreScript: true }
    }
    // check cuộc gọi điều kiện liệt theo trong nhóm tiêu chí 
    else if (typeUnScore == 'unScoreCriteriaGroup') {
      where = { unScoreCriteriaGroup: true }
    }

    const selectionUnScore = await model.ScoreScript.findAll({
      where: { id: idScoreScript },
      include: [{
        model: model.CriteriaGroup,
        as: 'CriteriaGroup',
        include: [{
          model: model.Criteria,
          as: 'Criteria',
          include: [{
            model: model.SelectionCriteria,
            as: 'SelectionCriteria',
            where: where
          }]
        }]
      }],
      raw: true
    })

    const idSelectionUnScore = _.pluck(selectionUnScore, 'CriteriaGroup.Criteria.SelectionCriteria.id')
    return await model.CallRating.findAll({
      where: {
        idSelectionCriteria: { [Op.in]: idSelectionUnScore }
      },
      attributes: [
        ['callId', 'callId']
      ],
      group: ['callId'],
      raw: true
    })
  } catch (error) {
    _logger.error(titlePage + " - lấy ds cuộc gọi bị liệt", error)
    return 0
  }
}

/**
 * Tổng điểm tối đa theo kịch bản
 * @param {String} idScoreScript id của kịch bản chấm điểm
 */
async function getSumScoreMax(idScoreScript) {
  try {
    const criterias = await model.ScoreScript.findAll({
      where: { id: idScoreScript },
      include: [{
        model: model.CriteriaGroup,
        as: 'CriteriaGroup',
        include: [{
          model: model.Criteria,
          as: 'Criteria',
        }]
      }],
      raw: true
    })
    return _.reduce(_.pluck(criterias, 'CriteriaGroup.Criteria.scoreMax'), function (memo, num) { return memo + num }, 0)
  } catch (error) {
    _logger.error(titlePage + " - Lấy tổng điểm theo kịch bản", error)
    return 0
  }
}

async function queryCallShareDetail(query, limit, offset) {

  let objectQuery = {
    where: whereCallShare(query),
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
        ],
        where: whereCallInfo(query)
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
        include: [{
          model: model.SelectionCriteria,
          as: 'selectionCriteriaInfo'
        }]
      },
      {
        model: model.User,
        as: 'userReview'
      }
    ],
    order: [['id']]
  }
  if (limit || offset) {
    objectQuery.limit = limit
    objectQuery.offset = offset
  }
  return await model.CallShare.findAll(objectQuery)
}


function createExcelFile(data, titleExcel, dataHeader) {
  return new Promise(async (resolve, reject) => {
    try {
      const linkFileExcel = await createExcelPromise({
        startTime: null,
        endTime: null,
        titleTable: titlePage,
        excelHeader: dataHeader,
        titlesHeader: titleExcel,
        data: data,
        opts: {
          valueWidthColumn: [20, 30, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
        }
      })
      return resolve(linkFileExcel)
    } catch (error) {
      return reject(error)
    }
  })
}