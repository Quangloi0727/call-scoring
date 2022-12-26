const titlePage = 'Danh sách cuộc gọi'
const pagination = require('pagination')
const { Op, QueryTypes } = require('sequelize')
const lodash = require('lodash')
const { createExcelPromise } = require('../common/createExcel')
const { SUCCESS_200, ERR_500, ERR_400, ERR_403 } = require("../helpers/constants/statusCodeHTTP")
const { USER_ROLE, SYSTEM_RULE, constTypeResultCallRating, headerDefaultRecording, keysTitleExcelRecording, SOURCE_NAME, CreatedByForm, STATUS_SCORE_SCRIPT } = require("../helpers/constants/index")
const { cheSo } = require("../helpers/functions")
const model = require('../models')
const ConfigurationColumsModel = require('../models/configurationcolums')
const { TeamStatus } = require('../helpers/constants/fileTeam')

exports.index = async (req, res, next) => {
  try {
    let isAdmin = false
    let { user } = req

    if (req.user.roles.find((item) => item.role == USER_ROLE.admin.n)) {
      isAdmin = true
    }

    let { teamIds } = await checkLeader(req.user.id)

    if (req.user.roles.find((item) => item.role == USER_ROLE.groupmanager.n)) {
      let userGroupTeam = await getTeamOfGroup(req.user.id)
      let teamIdMap = userGroupTeam.map(i => i.Group.TeamGroup.map(j => j.teamId)).filter(i => i.length > 0)

      let teamFound = []
      teamIdMap.forEach(i => {
        i.forEach(j => {
          if (!teamFound.includes(j)) teamFound.push(j)
        })
      })
      teamIds = _.uniq([...teamIds, ...teamFound])
    }
    const additionalField = fs.readFileSync(_pathFileAdditionField)

    let { teams: teamsDetail } = await getAgentTeamMemberDetail(isAdmin, teamIds, req.user.id)

    const groups = await model.Group.findAll()

    const getRoleEvaluator = await model.UserRole.findAll({ where: { role: USER_ROLE.evaluator.n } })
    const idsRoleEvaluator = _.pluck(getRoleEvaluator, 'userId')

    const getUserEvaluator = await model.User.findAll({ where: { id: { [Op.in]: idsRoleEvaluator } }, nest: true, raw: true })

    return _render(req, res, 'recording/index', {
      title: titlePage,
      titlePage: titlePage,
      rules: user.rules,
      headerDefault: _.mapHeaderDefault(headerDefaultRecording, JSON.parse(additionalField)),
      additionalField: JSON.parse(additionalField),
      SOURCE_NAME,
      SYSTEM_RULE,
      constTypeResultCallRating,
      CreatedByForm,
      teamsDetail: lodash.uniqBy(teamsDetail, 'memberId'), // master data
      teams: lodash.uniqBy(teamsDetail, 'teamId') || [],
      groups,
      getUserEvaluator
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.getRecording = async (req, res) => {
  try {
    const {
      page,
      startTime,
      endTime,
      caller,
      called,
      extension,
      exportExcel,
      fullName,
      userName,
      teamName,
      callDirection,
      teams,
      callId,
      sourceName,
      var1,
      var2,
      var3,
      var4,
      var5,
      var6,
      var7,
      var8,
      var9,
      var10,
      resultCallRating,
      evaluators,
      groups,
      sort // sort: {sort_by: target.attr('id-sort'), sort_type: 'ASC' }
    } = req.query
    let { limit } = req.query
    let { user } = req

    if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

    if (sort && !['ASC', 'DESC'].includes(sort.sort_type)) {
      return res.status(ERR_400.code).json({
        message: ERR_400.message_detail.sortTypeInValid
      })
    }

    limit = Number(limit)

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * limit) - limit
    let userIdFilter = []
    let query = ''
    let order = 'ORDER BY records.origTime DESC'
    let isAdmin = false
    let limitTimeExpires

    // check quyền xem dữ liệu
    if (!user.rules || !user.rules[SYSTEM_RULE.XEM_DU_LIEU.code]) return res.status(ERR_403.code).json({ message: ERR_403.message_detail.notHaveAccessData })

    if (user.rules[SYSTEM_RULE.XEM_DU_LIEU.code].expires >= 0) {
      let _now = _moment()
      limitTimeExpires = _now.add(-user.rules[SYSTEM_RULE.XEM_DU_LIEU.code].expires, 'days').unix() // second times
    }

    if (!startTime || startTime === '' || !endTime || endTime === '') {
      throw new Error('Thời gian bắt đầu và thời gian kết thúc là bắt buộc!')
    }

    let startTimeMilisecond = Number(_moment(startTime, 'DD/MM/YYYY').startOf('day').format('X'))
    let endTimeMilisecond = Number(_moment(endTime, 'DD/MM/YYYY').endOf('day').format('X'))

    if (startTimeMilisecond > endTimeMilisecond) {
      return res.status(ERR_400.code).json({
        message: ERR_400.message_detail.timeQueryInValid
      })
    }

    if (endTimeMilisecond - startTimeMilisecond > Number(_config.limitSearchDayRecording) * 86400) {
      return res.status(ERR_400.code).json({
        message: ERR_400.message_detail.searchDayRecordingInValid(_config.limitSearchDayRecording)
      })
    }

    if (req.user.roles.find((item) => item.role == USER_ROLE.admin.n)) {
      isAdmin = true
    }

    let { teamIds } = await checkLeader(req.user.id)

    if (req.user.roles.find((item) => item.role == USER_ROLE.supervisor.n)) {
      const getTeamDisable = await model.AgentTeamMember.findAll({ where: { userId: req.user.id, role: USER_ROLE.supervisor.n } })
      const arrTeamId = _.pluck(getTeamDisable, 'teamId')
      const getAgentOfTeam = await model.AgentTeamMember.findAll({
        where: { teamId: { [Op.in]: arrTeamId }, role: USER_ROLE.agent.n },
        include: [{
          model: model.Team,
          as: 'teams',
          where: {
            status: { [Op.eq]: TeamStatus.OFF }
          }
        }]
      })
      const userOfTeamOff = _.pluck(getAgentOfTeam, 'userId')
      if (userOfTeamOff.length > 0) query += `AND records.agentId not in (${userOfTeamOff.join(',')}) `
    }

    if (req.user.roles.find((item) => item.role == USER_ROLE.groupmanager.n)) {
      let userGroupTeam = await getTeamOfGroup(req.user.id)
      let teamIdMap = userGroupTeam.map(i => i.Group.TeamGroup.map(j => j.teamId)).filter(i => i.length > 0)

      let teamFound = []
      teamIdMap.forEach(i => {
        i.forEach(j => {
          if (!teamFound.includes(j)) teamFound.push(j)
        })
      })
      teamIds = _.uniq([...teamIds, ...teamFound])
    }

    if (!isAdmin && (!teamIds || teamIds.length <= 0)) {
      query += `AND records.agentId = ${req.user.id} `
    }

    if (!isAdmin && teamIds && teamIds.length > 0) {
      query += `AND ( records.agentId = ${req.user.id} OR records.teamId IN (${teamIds.toString()}) ) `
    }

    if (caller) query += `AND records.caller LIKE '%${caller.toString()}%' `
    if (called) query += `AND records.called LIKE '%${called.toString()}%' `
    if (extension) query += `AND agent.extension LIKE '%${extension.toString()}%' `
    if (var1) query += `AND records.var1 LIKE '%${var1.toString()}%' `
    if (var2) query += `AND records.var2 LIKE '%${var2.toString()}%' `
    if (var3) query += `AND records.var3 LIKE '%${var3.toString()}%' `
    if (var4) query += `AND records.var4 LIKE '%${var4.toString()}%' `
    if (var5) query += `AND records.var5 LIKE '%${var5.toString()}%' `
    if (var6) query += `AND records.var6 LIKE '%${var6.toString()}%' `
    if (var7) query += `AND records.var7 LIKE '%${var7.toString()}%' `
    if (var8) query += `AND records.var8 LIKE '%${var8.toString()}%' `
    if (var9) query += `AND records.var9 LIKE '%${var9.toString()}%' `
    if (var10) query += `AND records.var10 LIKE '%${var10.toString()}%' `
    if (resultCallRating) {
      let str = ``
      for (let i = 0; i < resultCallRating.length; i++) {
        str += `'${resultCallRating[i]}'`
      }
      query += `AND callShare.typeResultCallRating IN (${str}) `
    }
    if (evaluators) query += `AND callShare.idUserReview IN (${evaluators.toString()}) `
    if (groups) {
      const findTeamGroup = await model.TeamGroup.findAll({ where: { groupId: { [Op.in]: groups } }, nest: true, raw: true })
      const idsTeam = _.pluck(findTeamGroup, 'teamId')
      query += `AND records.teamId in (${idsTeam.toString()}) `
    }

    if (fullName) {
      userIdFilter = _.concat(userIdFilter, fullName)
    }
    if (userName) {
      userIdFilter = _.concat(userIdFilter, userName)
    }
    if (userIdFilter.length > 0) {
      userIdFilter = _.uniq(userIdFilter).map(i => Number(i))

      query += `AND agent.id IN (${userIdFilter.join()}) `

    }

    if (teamName) query += `AND team.name LIKE '%${teamName.toString()}%' `
    if (callDirection) query += `AND records.direction IN (${callDirection.map((item) => "'" + item + "'").toString()}) `
    if (teams) query += `AND team.id IN (${teams.toString()}) `
    if (callId) query += `AND records.id LIKE '%${callId.toString()}%' `
    if (sourceName) query += `AND records.sourceName in ('${sourceName.join("','")}') `

    // limit time by rule
    if (limitTimeExpires > startTimeMilisecond) startTimeMilisecond = limitTimeExpires

    // sort
    if (sort) {
      order = `ORDER BY records.${sort.sort_by} ${sort.sort_type}`
    }

    const ConfigurationColums = await getConfigurationColums(req.user.id)

    if (exportExcel && exportExcel == 1) {
      return await exportExcelHandle(req, res, startTimeMilisecond, endTimeMilisecond, query, order, ConfigurationColums)
    }

    let queryData = `

      SELECT
        records.id AS callId,
        records.id AS xmlCdrId,
        records.caller AS caller,
	      records.called AS called,
	      records.origTime AS origTime,
	      records.duration AS duration,
        records.teamId AS teamId,
	      records.var1 AS var1,
	      records.var2 AS var2,
	      records.var3 AS var3,
	      records.var4 AS var4,
	      records.var5 AS var5,
	      records.var6 AS var6,
	      records.var7 AS var7,
	      records.var8 AS var8,
	      records.var9 AS var9,
	      records.var10 AS var10,
        records.recordingFileName AS recordingFileName,
        records.direction AS direction,
        records.sourceName AS sourceName,
	      agent.fullName AS fullName,
	      agent.userName AS userName,
        team.name AS teamName,
        callShare.pointResultCallRating AS scoreScriptHandle,
				callShare.idUserReview AS idUserReview,
				userReviews.fullName + ' ( ' + userReviews.userName + ' ) ' AS scoreScriptCreatedBy,
        callShare.typeResultCallRating AS scoreScriptResult
      FROM dbo.call_detail_records records 
      LEFT JOIN dbo.Users agent ON records.agentId = agent.id
      LEFT JOIN dbo.Teams team ON records.teamId = team.id
      LEFT JOIN dbo.callShares callShare ON records.id = callShare.callId
			LEFT JOIN dbo.Users userReviews ON idUserReview = userReviews.id
      WHERE records.origTime >= ${Number(startTimeMilisecond)}  
        AND records.origTime <= ${Number(endTimeMilisecond)}
        AND (
          records.sourceName = '${SOURCE_NAME.oreka.code}'
          or
          (
            records.sourceName = '${SOURCE_NAME.fs.code}'
            and records.caller is not null
            and records.called is not null
          )
        )
	      ${query}
        ${order}
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `

    let queryCountData = `
      SELECT COUNT(*) AS total
      FROM dbo.call_detail_records records 
      LEFT JOIN dbo.Users agent ON records.agentId = agent.id
      LEFT JOIN dbo.Teams team ON records.teamId = team.id
      LEFT JOIN dbo.callShares callShare ON records.id = callShare.callId
			LEFT JOIN dbo.Users userReviews ON idUserReview = userReviews.id
      WHERE records.origTime >= ${Number(startTimeMilisecond)}  
        AND records.origTime <= ${Number(endTimeMilisecond)}
        AND (
          records.sourceName = '${SOURCE_NAME.oreka.code}'
          or
          (
            records.sourceName = '${SOURCE_NAME.fs.code}'
            and records.caller is not null
            and records.called is not null
          )
        )
	      ${query}
    `

    const [recordResult, totalData] = await Promise.all([
      await model.sequelize.query(queryData, { type: QueryTypes.SELECT }),
      await model.sequelize.query(queryCountData, { type: QueryTypes.SELECT }),
    ])

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: totalData && totalData[0] && totalData[0].total || 0
    })

    const dataHandle = await handleData(recordResult, _config.privatePhoneNumberWebView)

    const dataFinal = await mapScoreScript(dataHandle)

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: dataFinal,
      ConfigurationColums: ConfigurationColums,
      paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
    })
  } catch (error) {
    console.log(`------- error ------- getRecording`)
    console.log(error)
    console.log(`------- error ------- getRecording`)

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.SaveConfigurationColums = async (req, res) => {
  let transaction
  try {
    const data = {}
    data.userId = req.user.id
    data.configurationColums = JSON.stringify(req.body)
    data.nameTable = titlePage

    transaction = await model.sequelize.transaction()
    const result = await ConfigurationColumsModel.update(
      data,
      { where: { userId: Number(req.user.id), nameTable: titlePage } },
      { transaction: transaction }
    )
    if (result[0] == 0) {
      await ConfigurationColumsModel.create(data, { transaction: transaction })
    }
    await transaction.commit()
    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    })
  } catch (error) {
    console.log(`------- error ------- getRecording`)
    console.log(error)
    console.log(`------- error ------- getRecording`)

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.deleteConfigurationColums = async (req, res) => {
  let transaction
  try {
    const data = {}
    data.userId = req.user.id
    transaction = await model.sequelize.transaction()
    const result = await model.ConfigurationColums.destroy(
      { where: { userId: Number(req.user.id), nameTable: titlePage } },
      { transaction: transaction }
    )

    await transaction.commit()
    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    })
  } catch (error) {
    console.log(`------- error ------- deleteConfigurationColums`)
    console.log(error)
    console.log(`------- error ------- deleteConfigurationColums`)

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

function getConfigurationColums(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await model.ConfigurationColums.findAll({ where: { userId: userId, nameTable: titlePage } })
      if (result && result[0] && result[0].configurationColums) {
        return resolve(JSON.parse(result[0].configurationColums))
      }
      return resolve(null)
    } catch (error) {
      return reject(error)
    }
  })
}

function checkLeader(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let teamIds = []

      const results = await model.sequelize.query(
        `
          SELECT
            Teams.id AS teamId,
            Teams.name AS teamName 
          FROM dbo.AgentTeamMembers
          LEFT JOIN dbo.Teams ON AgentTeamMembers.teamId = Teams.id 
          WHERE AgentTeamMembers.userId = ${Number(userId)}
            AND AgentTeamMembers.role = 1
        `,
        { type: QueryTypes.SELECT }
      )

      teamIds = _.map(results, 'teamId')

      return resolve({ teams: results, teamIds: teamIds })
    } catch (error) {
      return reject(error)
    }
  })
}

function getAgentTeamMemberDetail(isAdmin, teamIds = [], userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let conditionQuery = ''
      if (isAdmin == true) {
        conditionQuery = `team.name <> 'Default'`
      } else {
        // sup
        if (teamIds.length > 0) {
          conditionQuery = `team.id IN (${teamIds.join(',')}) AND AgentTeamMembers.role =  ${USER_ROLE.agent.n}`
        } else {
          // agent
          conditionQuery = `AgentTeamMembers.userId = ${Number(userId)}`
        }

      }

      conditionQuery += `AND team.status = ${TeamStatus.ON}` //get team active

      const result = await model.sequelize.query(
        `
            SELECT
              team.id AS teamId,
              team.name AS teamName,
              memberOfTeam.id AS memberId,
              memberOfTeam.fullName AS memberFullName,
              memberOfTeam.userName AS memberUserName
            FROM dbo.Teams team
            LEFT JOIN dbo.AgentTeamMembers agentTeamMembers ON team.id = AgentTeamMembers.teamId
            LEFT JOIN dbo.Users memberOfTeam ON agentTeamMembers.userId = memberOfTeam.id
            
            WHERE ${conditionQuery}

            GROUP BY team.id, team.name, memberOfTeam.id, memberOfTeam.fullName, memberOfTeam.userName
        `,
        { type: QueryTypes.SELECT }
      )
      return resolve({ teams: result })
    } catch (error) {
      return reject(error)
    }
  })
}

async function handleData(data, privatePhoneNumber = false) {
  const newData = await Promise.all(data.map(async el => {
    el.origTime = _moment(el.origTime * 1000).format('HH:mm:ss DD/MM/YYYY')
    el.duration = _.hms(el.duration)
    el.recordingFileName = _config.pathRecording + el.recordingFileName

    // che số
    if (privatePhoneNumber) {
      if (el.caller && el.caller.length >= 10) el.caller = cheSo(el.caller, 4)
      if (el.called && el.called.length >= 10) el.called = cheSo(el.called, 4)
    }

    // map group
    if (el.teamId) {
      const findTeamGroup = await model.TeamGroup.findAll({ where: { teamId: el.teamId }, nest: true })
      if (!findTeamGroup.length) return el
      const idsGroup = _.pluck(findTeamGroup, "groupId")
      const findGroup = await model.Group.findAll({ where: { id: { [Op.in]: idsGroup } }, nest: true })
      const nameGroups = _.pluck(findGroup, "name")
      el.groupName = nameGroups.join(",")
    }

    if (el.scoreScriptResult) {
      if (el.scoreScriptResult == constTypeResultCallRating.pointNeedImprove.code) el.scoreScriptResult = constTypeResultCallRating.pointNeedImprove.txt
      if (el.scoreScriptResult == constTypeResultCallRating.pointStandard.code) el.scoreScriptResult = constTypeResultCallRating.pointStandard.txt
      if (el.scoreScriptResult == constTypeResultCallRating.pointPassStandard.code) el.scoreScriptResult = constTypeResultCallRating.pointPassStandard.txt
    }

    return el

  }))
  return newData
}

async function exportExcelHandle(req, res, startTime, endTime, query, order, ConfigurationColums) {
  try {
    const dataResult = await model.sequelize.query(`
      SELECT
        records.id AS callId,
        records.id AS xmlCdrId,
	      records.caller AS caller,
	      records.called AS called,
	      records.origTime AS origTime,
        records.duration AS duration,
        records.var1 AS var1,
	      records.var2 AS var2,
	      records.var3 AS var3,
	      records.var4 AS var4,
	      records.var5 AS var5,
	      records.var6 AS var6,
	      records.var7 AS var7,
	      records.var8 AS var8,
	      records.var9 AS var9,
	      records.var10 AS var10,
        records.teamId AS teamId,
	      records.recordingFileName AS recordingFileName,
        records.direction AS direction,
        records.sourceName AS sourceName,
	      agent.fullName AS fullName,
        agent.userName AS userName,
        team.name AS teamName,
        callShare.pointResultCallRating AS scoreScriptHandle,
				callShare.idUserReview AS idUserReview,
				userReviews.fullName + ' ( ' + userReviews.userName + ' ) ' AS scoreScriptCreatedBy,
        callShare.typeResultCallRating AS scoreScriptResult
      FROM dbo.call_detail_records records 
      LEFT JOIN dbo.Users agent ON records.agentId = agent.id
      LEFT JOIN dbo.Teams team ON records.teamId = team.id
      LEFT JOIN dbo.callShares callShare ON records.id = callShare.callId
			LEFT JOIN dbo.Users userReviews ON idUserReview = userReviews.id
      WHERE records.origTime >= ${Number(startTime)}  
        AND records.origTime <= ${Number(endTime)}
        AND (
          records.sourceName = '${SOURCE_NAME.oreka.code}'
          or
          (
            records.sourceName = '${SOURCE_NAME.fs.code}'
            and records.caller is not null
            and records.called is not null
          )
        )
	      ${query}
        ${order}
    `, { type: QueryTypes.SELECT })

    const dataHandleResult = await handleData(dataResult, _config.privatePhoneNumberExcel)

    const linkFile = await createExcelFile(startTime, endTime, dataHandleResult, ConfigurationColums)

    return res.status(SUCCESS_200.code).json({ linkFile: linkFile })
  } catch (error) {
    throw new Error(error)
  }
}

function createExcelFile(startDate, endDate, data, ConfigurationColums) {
  return new Promise(async (resolve, reject) => {
    try {

      let startTime = _moment.unix(Number(startDate)).startOf('day').format('HH:mm DD/MM/YYYY')
      let endTime = _moment.unix(Number(endDate)).endOf('day').format('HH:mm DD/MM/YYYY')

      let titleExcel = {}
      let dataHeader = {}

      if (ConfigurationColums) {
        Object.keys(ConfigurationColums).forEach(i => {

          if (i == 'audioHtml' || i == 'action' || ConfigurationColums[i] == 'false') return // nếu là file ghi âm thì tạm thời bỏ qua do không có trang hiển thị chi tiết 1 file ghi âm

          titleExcel[`TXT_${i.toUpperCase()}`] = headerDefaultRecording[i]
          dataHeader[`TXT_${i.toUpperCase()}`] = i
        })
      } else {
        const additionalField = fs.readFileSync(_pathFileAdditionField)
        const headerDefault = _.mapHeaderDefault(headerDefaultRecording, JSON.parse(additionalField))
        Object.keys(keysTitleExcelRecording).forEach(i => {
          let nameField = keysTitleExcelRecording[i]
          titleExcel[`TXT_${nameField.toUpperCase()}`] = headerDefault[nameField]
          dataHeader[`TXT_${nameField.toUpperCase()}`] = nameField
        })
      }

      let newData = data.map((item) => {
        item.callId = item.callId || item.xmlCdrId
        agentName = item.fullName && `${item.fullName} (${item.userName})` || ''
        return {
          ...item,
          duration: item.duration || '',
          agentName: agentName
        }
      })

      const linkFileExcel = await createExcelPromise({
        startTime: startTime,
        endTime: endTime,
        titleTable: titlePage,
        excelHeader: dataHeader,
        titlesHeader: titleExcel,
        data: newData,
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

async function getTeamOfGroup(userId) {
  return await model.UserGroupMember.findAll({
    where: {
      userId,
      role: USER_ROLE.groupmanager.n
    },
    include: [{
      model: model.Group,
      as: 'Group',
      include: [{
        model: model.TeamGroup,
        as: 'TeamGroup'
      }]
    }],
    nest: true
  })

}

async function mapScoreScript(data) {
  // cuộc gọi đã được phân công thì lấy luôn kịch bản ngược lại chưa phân công thì lấy toàn bộ kịch bản đang active
  const dataMapScoreScript = Promise.all(data.map(async el => {
    const findInCallShare = await model.CallShare.findOne({ where: { callId: { [Op.eq]: el.callId || el.xmlCdrId } }, raw: true })
    if (findInCallShare && findInCallShare.isMark == false) {
      //case đã phân công nhưng chưa chấm
      const findScoreScript = await model.ScoreTarget.findOne({
        where: { id: { [Op.eq]: findInCallShare.scoreTargetId } },
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
      })
      el.isMark = false
      el.ScoreTarget_ScoreScript = findScoreScript.ScoreTarget_ScoreScript || []
    } else if (findInCallShare && findInCallShare.isMark == true) {
      //case đã phân công nhưng chấm rồi (màn edit)
      el.isMark = true
      el.ScoreTarget_ScoreScript = []
      const findScoreScriptMarked = await model.CallRating.findOne({ where: { callId: el.callId || el.xmlCdrId } })
      if (findScoreScriptMarked && findScoreScriptMarked.idScoreScript) el.idScoreScript = findScoreScriptMarked.idScoreScript
    } else {
      // chưa phân công và lấy toàn bộ kịch bản đang active
      const findMarked = await model.CallRating.findOne({ where: { callId: { [Op.eq]: el.callId || el.xmlCdrId } }, raw: true })
      if(findMarked){
        el.isMark = true
        el.idScoreScript = findMarked.idScoreScript
      }else{
        const findListScoreScriptActive = await model.ScoreScript.findAll({ where: { status: STATUS_SCORE_SCRIPT.hoatDong.n }, raw: true })
        el.isMark = false
        el.ScoreTarget_ScoreScript = findListScoreScriptActive
      }
    }
    return el
  }))
  return dataMapScoreScript

}