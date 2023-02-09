const titlePage = 'Báo cáo chấm điểm cuộc gọi'
const titleSheet = 'Bảng thống kê'
const {
  STATUS,
  USER_ROLE,
  TeamStatus,
  SOURCE_NAME,
  CONST_STATUS,
  constTypeResultCallRating,
  headerReportCallRating,
  OP_UNIT_DISPLAY
} = require('../helpers/constants/index')
const { Op, QueryTypes } = require('sequelize')
const sequelize = require('sequelize')
const model = require('../models')
const pagination = require('pagination')
const { SUCCESS_200, ERR_400 } = require("../helpers/constants/statusCodeHTTP")
const { createExcelPromise } = require('../common/createExcel')

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
      OP_UNIT_DISPLAY
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

    const _queryScore = buildQuery(req.query)
    _logger.info("buildQueryScore", _queryScore)
    console.log("buildQueryScore", _queryScore)

    // lấy dữ liệu tổng hợp 
    const [countCallShare, countCallReviewed, CallRatingReScore, percentTypeCallRating, totalCall] = await getSummaryData(_queryScore)

    const CallShareDetail = await queryCallShareDetail(_queryScore, limit, offset)

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
      percentTypeCallRating: _.removeValueEmptyOfKey(percentTypeCallRating, 'name'),
      totalCall: totalCall,
      callShareDetail: await mapGroupName(CallShareDetail),
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

    const _queryScoreScript = buildQuery(req.query)
    _logger.info("buildQueryScoreScript", _queryScoreScript)
    console.log("buildQueryScoreScript", _queryScoreScript)

    // cuộc gọi đã đánh giá
    const countCallShare = await model.CallShare.count({ where: _queryScoreScript, raw: true })

    // điểm trung bình
    const avgPointByCall = await model.CallShare.findAll({
      where: _queryScoreScript,
      attributes: [
        [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.cast(sequelize.col('pointResultCallRating'), 'float')), 2), 'avgPoint']
      ],
      raw: true
    })
    const sumScoreMax = await getSumScoreMax(idScoreScript)

    // tỉ lệ điểm liệt kịch bản
    const unScoreScript = await getUnScore('unScoreScript', _queryScoreScript)
    const countCallReviewed = countCallShare

    // tỉ lệ điểm liệt nhóm tiêu chí
    const unScoreCriteriaGroup = await getUnScore('unScoreCriteriaGroup', _queryScoreScript)

    const CallShareDetail = await queryCallShareDetail(_queryScoreScript, limit, offset)

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: countCallShare
    })

    //dữ liệu chấm điểm theo loại đánh giá
    const percentTypeCallRating = await model.CallShare.findAll({
      where: _queryScoreScript,
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
      avgPointByCall: avgPointByCall[0].avgPoint ? avgPointByCall[0].avgPoint : 0,
      sumScoreMax: sumScoreMax,
      unScoreCriteriaGroup: unScoreCriteriaGroup,
      unScoreScript: unScoreScript,
      percentTypeCallRating: _.removeValueEmptyOfKey(percentTypeCallRating, 'name'),
      constTypeResultCallRating: constTypeResultCallRating,
      callShareDetail: await mapGroupName(CallShareDetail),
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
    const { idCriteria } = req.query
    const _queryGroupSelection = buildQuery(req.query)
    _logger.info("_queryGroupSelection", _queryGroupSelection)
    console.log("_queryGroupSelection", _queryGroupSelection)
    const findGroupSelection = await model.CallShare.findAll({
      where: _queryGroupSelection,
      include: [{
        model: model.CallRating,
        as: 'callRatingInfo',
        attributes: ['idCriteria', 'idSelectionCriteria'],
        where: { idCriteria: idCriteria },
        raw: true,
        include: [{
          model: model.SelectionCriteria,
          as: 'selectionCriteriaInfo',
          attributes: ['name'],
          raw: true
        }]
      }],
      attributes: [[sequelize.fn('count', 1), 'y']],
      group: ["callRatingInfo.idCriteria", "callRatingInfo.idSelectionCriteria", "callRatingInfo.selectionCriteriaInfo.name"],
      raw: true
    })
    const dataFinal = findGroupSelection.map(el => {
      el.name = el['callRatingInfo.selectionCriteriaInfo.name']
      if (el.name == null) el.name = "Không đủ thông tin để chấm"
      return el
    })
    return res.json({
      code: SUCCESS_200.code,
      percentSelectionCriteria: dataFinal
    })
  } catch (error) {
    _logger.error(titlePage + " - Lấy tiêu chí lỗi", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.exportExcelData = async (req, res) => {
  try {
    const _queryScore = buildQuery(req.query)
    _logger.info("buildQueryScore", _queryScore)
    console.log("buildQueryScore", _queryScore)
    const callShareDetail = await queryCallShareDetail(_queryScore)
    let titleExcel = {}
    let dataHeader = {}

    for (const [key, value] of Object.entries(headerReportCallRating)) {
      titleExcel[`TXT_${key.toUpperCase()}`] = value
      dataHeader[`TXT_${key.toUpperCase()}`] = key
    }
    const convertData = JSON.parse(JSON.stringify(callShareDetail))
    const newData = await Promise.all(convertData.map(async (item) => {
      // map group
      if (item.teamIdOfCall) {
        const findTeamGroup = await model.TeamGroup.findAll({ where: { teamId: item.teamIdOfCall }, nest: true })
        if (!findTeamGroup.length) {
          item.callInfo.groupName = ''
        } else {
          const idsGroup = _.pluck(findTeamGroup, "groupId")
          const findGroup = await model.Group.findAll({ where: { id: { [Op.in]: idsGroup } }, nest: true })
          const nameGroups = _.pluck(findGroup, "name")
          item.callInfo.groupName = nameGroups.join(',')
        }
      }
      return {
        ...item,
        callId: item.callInfo.id || '',
        direction: item.callInfo.direction || '',
        agentName: item.callInfo.agent ? item.callInfo.agent.fullName + '(' + item.callInfo.agent.userName + ')' : '',
        teamName: item.callInfo.team ? item.callInfo.team.name : '',
        groupName: item.callInfo.groupName || '',
        scoreTarget: item.scoreTargetInfo ? item.scoreTargetInfo.name : '',
        scoreScriptAuto: '',
        scoreScript: item.scoreScriptInfo ? item.scoreScriptInfo.name : '',
        scoreScriptHandle: renderPointResultCallRating(item),
        scoreScriptResult: item.typeResultCallRating ? constTypeResultCallRating[`point${item.typeResultCallRating}`].txt : '',
        userReview: item.userReview ? item.userReview.fullName + ' ' + `(${item.userReview.userName})` : '',
        reviewedAt: item.reviewedAt ? _moment(item.reviewedAt).format('DD/MM/YYYY HH:mm:ss') : '',
      }
    }))

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
    const _queryScoreScript = buildQuery(req.query)
    _logger.info("buildQueryScoreScript", _queryScoreScript)
    console.log("buildQueryScoreScript", _queryScoreScript)
    const callShareDetail = await queryCallShareDetail(_queryScoreScript)
    const detailScoreScript = await model.ScoreScript.findOne({
      where: { id: req.query.idScoreScript },
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
    const convertData = JSON.parse(JSON.stringify(callShareDetail))
    const newData = await Promise.all(convertData.map(async (callShare) => {
      // map group
      if (callShare.teamIdOfCall) {
        const findTeamGroup = await model.TeamGroup.findAll({ where: { teamId: callShare.teamIdOfCall }, nest: true })
        if (!findTeamGroup.length) {
          callShare.callInfo.groupName = ''
        } else {
          const idsGroup = _.pluck(findTeamGroup, "groupId")
          const findGroup = await model.Group.findAll({ where: { id: { [Op.in]: idsGroup } }, nest: true })
          const nameGroups = _.pluck(findGroup, "name")
          callShare.callInfo.groupName = nameGroups.join(',')
        }
      }
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
            if (found.selectionCriteriaInfo && found.selectionCriteriaInfo.unScoreCriteriaGroup) checkIsUnScoreCriteriaGroup = true
            resultScoreCriteriaGroup += found.selectionCriteriaInfo && found.selectionCriteriaInfo.score ? found.selectionCriteriaInfo.score : 0
          }
          criteria[`criteria_${Criteria.id}`] = `${found.selectionCriteriaInfo && found.selectionCriteriaInfo.score ? found.selectionCriteriaInfo.score : 0} - ${(((found.selectionCriteriaInfo && found.selectionCriteriaInfo.score ? found.selectionCriteriaInfo.score : 0) / Criteria.scoreMax) * 100).toFixed(0) + '%'}`
          criteria[`selectionCriteria_${Criteria.id}`] = `${found.selectionCriteriaInfo && found.selectionCriteriaInfo.name ? found.selectionCriteriaInfo.name : 'Không đủ thông tin để chấm'}`
          tempTitleExcel[`TXT_${`criteria_${Criteria.id}`.toUpperCase()}`] = Criteria.name
          tempDataHeader[`TXT_${`criteria_${Criteria.id}`.toUpperCase()}`] = `criteria_${Criteria.id}`
          tempTitleExcel[`TXT_${`selectionCriteria_${Criteria.id}`.toUpperCase()}`] = 'Lựa chọn của tiêu chí'
          tempDataHeader[`TXT_${`selectionCriteria_${Criteria.id}`.toUpperCase()}`] = `selectionCriteria_${Criteria.id}`

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
        agentName: callShare.callInfo.agent ? callShare.callInfo.agent.fullName + '(' + callShare.callInfo.agent.userName + ')' : '',
        teamName: callShare.callInfo.team ? callShare.callInfo.team.name : '',
        groupName: callShare.callInfo.groupName || '',
        scoreTarget: callShare.scoreTargetInfo ? callShare.scoreTargetInfo.name : '',
        scoreScriptAuto: '',
        scoreScript: callShare.scoreScriptInfo ? callShare.scoreScriptInfo.name : '',
        scoreScriptHandle: renderPointResultCallRating(callShare),
        scoreScriptResult: callShare.typeResultCallRating ? constTypeResultCallRating[`point${callShare.typeResultCallRating}`].txt : '',
        userReview: callShare.userReview ? callShare.userReview.fullName + ' ' + `(${callShare.userReview.userName})` : '',
        reviewedAt: callShare.reviewedAt ? _moment(callShare.reviewedAt).format('DD/MM/YYYY HH:mm:ss') : '',
      }
    }))

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

function renderPointResultCallRating(callShare) {
  let pointResultCallRating = '-'
  if (callShare.scoreScriptInfo && callShare.scoreScriptInfo.scoreDisplayType == OP_UNIT_DISPLAY.phanTram.n) {
    pointResultCallRating = _.convertPercentNumber(callShare.pointResultCallRating, callShare.scoreMax) + `%`
  } else {
    pointResultCallRating = `${callShare.pointResultCallRating} / ${callShare.scoreMax}` || 0
  }
  return pointResultCallRating
}

function getUserByRole(idRole) {
  return model.User.findAll({
    where: { isActive: true },
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

async function mapGroupName(data) {
  const convertData = JSON.parse(JSON.stringify(data))
  return await Promise.all(convertData.map(async el => {
    // map group
    if (el.teamIdOfCall) {
      const findTeamGroup = await model.TeamGroup.findAll({ where: { teamId: el.teamIdOfCall }, nest: true })
      if (!findTeamGroup.length) return el
      const idsGroup = _.pluck(findTeamGroup, "groupId")
      const findGroup = await model.Group.findAll({ where: { id: { [Op.in]: idsGroup } }, nest: true })
      const nameGroups = _.pluck(findGroup, "name")
      el.callInfo.groupName = nameGroups
    }
    return el
  }))
}

async function getSummaryData(_queryScore) {
  const { isMark: _, ..._queryTotalCallShare } = _queryScore
  const _queryTotalCallDetailRecord = {}
  for (const key in _queryScore) {
    if (key == 'agentIdOfCall') _queryTotalCallDetailRecord.agentId = _queryScore.agentIdOfCall
    if (key == 'teamIdOfCall') _queryTotalCallDetailRecord.teamId = _queryScore.teamIdOfCall
    if (key == 'sourceNameOfCall') _queryTotalCallDetailRecord.sourceName = _queryScore.sourceNameOfCall
    if (key == 'origTime') _queryTotalCallDetailRecord.origTime = _queryScore.origTime
  }
  return await Promise.all([
    // lấy tổng số cuộc gọi đã phân công
    model.CallShare.count({ where: { [Op.and]: [_queryTotalCallShare, { scoreTargetId: { [Op.ne]: null } }] }, raw: true }),

    // tổng cuộc gọi đã được chấm điểm
    model.CallShare.count({ where: _queryScore, raw: true }),

    //tổng cuộc đã chấm lại 
    model.CallShare.count({ where: { [Op.and]: [{ updateReviewedAt: { [Op.gt]: model.sequelize.col('reviewedAt') } }, _queryScore] }, raw: true }),

    //dữ liệu chấm điểm theo loại đánh giá
    model.CallShare.findAll({
      where: _queryScore,
      attributes: [
        ['typeResultCallRating', 'name'],
        [model.Sequelize.literal(`COUNT(1)`), 'y']
      ],
      group: ['typeResultCallRating'],
      raw: true
    }),

    // tổng cuộc gọi có trong hệ thống
    model.CallDetailRecords.count({ where: _queryTotalCallDetailRecord, raw: true })

  ])
}

function buildQuery(query) {
  let _query = {}
  const { idScoreScript, gradingDate, idAgent, idEvaluator, idScoreTarget_tapScoreScript, idTeam, origDate, sourceType_tapScoreScript } = query
  if (gradingDate) {
    const stringGradingDate = gradingDate.split(' - ')
    _query[Op.and] = [
      { reviewedAt: { [Op.gte]: _moment(stringGradingDate[0], "DD/MM/YYYY").startOf('day').format('YYYY-MM-DD HH:mm:ss') } },
      { reviewedAt: { [Op.lte]: _moment(stringGradingDate[1], "DD/MM/YYYY").endOf('day').format('YYYY-MM-DD HH:mm:ss') } }
    ]
  }

  if (idEvaluator) {
    _query = { ..._query, idUserReview: { [Op.in]: idEvaluator } }
  }

  if (idScoreScript) {
    _query = { ..._query, idScoreScript: idScoreScript }
  }

  if (idAgent) {
    _query = { ..._query, agentIdOfCall: { [Op.in]: idAgent } }
  }

  if (idTeam) {
    _query = { ..._query, teamIdOfCall: { [Op.in]: idTeam } }
  }

  if (sourceType_tapScoreScript) {
    _query = { ..._query, sourceNameOfCall: { [Op.in]: sourceType_tapScoreScript } }
  }

  if (origDate) {
    const stringOrigDate = origDate.split(' - ')
    const callStartTimeQuery = _moment(stringOrigDate[0], "DD/MM/YYYY").startOf("d").valueOf()
    const callEndTimeQuery = _moment(stringOrigDate[1], "DD/MM/YYYY").endOf("d").valueOf()
    _query = { ..._query, origTime: { [Op.and]: [{ [Op.gte]: (callStartTimeQuery / 1000) }, { [Op.lte]: (callEndTimeQuery / 1000) }] } }
  }

  if (idScoreTarget_tapScoreScript) {
    _query = { ..._query, scoreTargetId: { [Op.in]: idScoreTarget_tapScoreScript } }
  }
  return { ..._query, isMark: true }
}

/**
 * Tổng cuộc gọi bị liệt kịch bản hoặc liệt nhóm tiêu chí
 * @param {String} typeUnScore loại điểm liệt: Liệt kịch bản - Liệt tiêu chí
 * @param {String} idScoreScript id của kịch bản chấm điểm
 */
async function getUnScore(typeUnScoreCheck, _queryScoreScript) {
  try {
    let _query = {}

    // check cuộc gọi điều kiện liệt theo kịch bản
    if (typeUnScoreCheck == 'unScoreScript') _query = { unScoreScript: true }
    if (typeUnScoreCheck == 'unScoreCriteriaGroup') _query = { unScoreCriteriaGroup: true }

    const total = await model.CallShare.count({
      where: _queryScoreScript,
      include: [{
        model: model.CallRating,
        as: 'callRatingInfo',
        include: [{
          model: model.SelectionCriteria,
          as: 'selectionCriteriaInfo',
          where: _query
        }],
        required: true
        // required: true -> inner join,false -> left outer join
      }]
    })
    return total || 0
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

async function queryCallShareDetail(_queryScore, limit, offset) {
  return await model.CallShare.findAll({
    where: _queryScore,
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
        as: 'scoreTargetInfo',
        include: [
          {
            model: model.ScoreTarget_ScoreScript,
            as: 'ScoreTarget_ScoreScript',
            include: {
              model: model.ScoreScript,
              as: 'scoreScriptInfo'
            }
          }
        ]
      },
      {
        model: model.CallRating,
        as: 'callRatingInfo',
        include: {
          model: model.SelectionCriteria,
          as: 'selectionCriteriaInfo'
        }
      },
      {
        model: model.ScoreScript,
        as: 'scoreScriptInfo'
      },
      {
        model: model.User,
        as: 'userReview'
      }
    ],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    offset: offset,
    limit: limit
  })
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
        },
        titleSheet
      })
      return resolve(linkFileExcel)
    } catch (error) {
      return reject(error)
    }
  })
}