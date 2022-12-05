const { Op } = require('sequelize')
const pagination = require('pagination')
const titlePage = 'Mục tiêu chấm điểm'
const { SUCCESS_200, ERR_500 } = require("../helpers/constants/statusCodeHTTP")
const model = require('../models')
const UserRoleModel = require('../models/userRole')
const { TeamStatus } = require('../helpers/constants/fileTeam')

const {
  scoreTargetNotFound,
  statusUpdateFail,
  headerDefault,
  CONST_RATING_BY,
  CONST_CALL_TYPE,
  CONST_EFFECTIVE_TIME_TYPE,
  CONST_STATUS,
  CONST_DATA,
  CONST_COND,
  MESSAGE_ERROR,
  SYSTEM_RULE } = require('../helpers/constants/index')

exports.index = async (req, res, next) => {
  try {
    return _render(req, res, 'scoreTarget/index', {
      title: titlePage,
      titlePage: titlePage,
      CONST_STATUS,
      headerDefault: headerDefault
    })
  } catch (error) {
    _logger.error(`------- error scoreTargetController index ------- `)
    _logger.error(error)
    return next(error)
  }
}

exports.new = async (req, res, next) => {
  try {

    const scoreScript = await model.ScoreScript.findAll({
      where: { status: CONST_STATUS.ACTIVE.value },
      attributes: ['name', 'id'],
      raw: true,
      nest: true
    })

    let users = await model.User.findAll({ where: { isActive: 1 } })
    let teams = await model.Team.findAll({ where: { status: TeamStatus.ON, name: { [Op.ne]: 'Default' } } })
    let groups = await model.Group.findAll({})

    return _render(req, res, 'scoreTarget/target', {
      titlePage: null,
      ScoreTarget: {},
      ScoreTargetAuto: {},
      ScoreTargetCond: [],
      ScoreTarget_ScoreScript: [],
      scoreScript: scoreScript.length > 0 ? scoreScript : [],
      CONST_RATING_BY,
      CONST_CALL_TYPE,
      CONST_EFFECTIVE_TIME_TYPE,
      CONST_STATUS,
      CONST_DATA,
      CONST_COND,
      users,
      teams,
      groups,
      isEdit: false,
      listUserAssignment: [],
      userAssigned: []
    })

  } catch (error) {
    _logger.error(`------- error ------- `)
    _logger.error("render ds mục tiêu chấm điểm lỗi", error)
    return next(error)
  }
}

exports.detail = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id || id == '') {
      throw new Error('Nhóm không tồn tại!')
    }

    const scoreScript = await model.ScoreScript.findAll({
      where: { status: CONST_STATUS.ACTIVE.value },
      attributes: ['name', 'id'],
      raw: true,
      nest: true
    })

    let detail = await model.ScoreTarget.findOne({
      where: { id: { [Op.eq]: Number(id) } },
      nest: true,
      raw: true,
    })

    let [ScoreTargetAuto, ScoreTargetCond, ScoreTarget_ScoreScript, users, teams, groups, listUserAssignment, userAssigned] = await Promise.all([
      model.ScoreTargetAuto.findAll({
        where: { scoreTargetId: { [Op.eq]: Number(id) } },
        include: [
          { model: model.ScoreTargetKeywordSet, as: 'KeywordSet' },
        ],
        order: [
          ['id', 'DESC'],
        ],
        nest: true,
      }),
      model.ScoreTargetCond.findAll({ where: { scoreTargetId: { [Op.eq]: Number(id) } } }),
      model.ScoreTarget_ScoreScript.findAll({ where: { scoreTargetId: { [Op.eq]: Number(id) } } }),
      model.User.findAll({ where: { isActive: 1 } }),
      model.Team.findAll({ where: { status: TeamStatus.ON, name: { [Op.ne]: 'Default' } } }),
      model.Group.findAll({}),
      getListUserAssignment(),
      model.ScoreTargetAssignment.findAll({ where: { scoreTargetId: id } }),
    ])

    return _render(req, res, 'scoreTarget/target', {
      titlePage: null,
      scoreScript: scoreScript.length > 0 ? scoreScript : [],
      ScoreTarget: detail,
      ScoreTargetAuto: ScoreTargetAuto,
      ScoreTargetCond: ScoreTargetCond,
      ScoreTarget_ScoreScript: ScoreTarget_ScoreScript,
      CONST_RATING_BY,
      CONST_CALL_TYPE,
      CONST_EFFECTIVE_TIME_TYPE,
      CONST_STATUS,
      CONST_DATA,
      CONST_COND,
      users,
      teams,
      groups,
      isEdit: true,
      listUserAssignment,
      userAssigned
    })
  } catch (error) {
    _logger.error(`------- error ------- `)
    _logger.error(error)
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
        [Op.like]: '%' + name + '%'
      }
    }
    if (status || status == "0") {
      query.status = status
    }

    const { count, rows } = await model.ScoreTarget.findAndCountAll({
      where: query ? query : {},
      order: [
        ['id', 'DESC'],
      ],
      include: [
        { model: model.User, as: 'userCreate' },
        { model: model.User, as: 'userUpdate' },
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
    return res.json({
      code: SUCCESS_200.code, data: rows || [],
      paginator: {
        ...paginator.getPaginationData(),
        rowsPerPage: limit
      }
    })
  } catch (error) {
    _logger.error("Lấy danh sách Mục tiêu  chấm điểm lỗi", error)
    return res.json({ code: ERR_500.code, message: error.message })
  }
}

exports.create = async (req, res, next) => {
  let transaction

  try {
    let data = req.body
    const { callTime, name, effectiveTime, effectiveTimeType, arrTargetAuto, arrCond, numberOfCall } = req.body
    let scoreScriptId = req.body.scoreScriptId
    transaction = await model.sequelize.transaction()

    //nếu k chọn kịch bản mặc định lấy tất cả các kich bản đang hoạt động
    if (!scoreScriptId) {
      const scoreScripts = await model.ScoreScript.findAll({ where: { status: CONST_STATUS.ACTIVE.value }, attributes: ['name', 'id'], raw: true })
      if (scoreScripts.length) scoreScriptId = _.pluck(scoreScripts, "id")
    }

    if (callTime) {
      let string = callTime.split(' - ')

      data.callStartTime = _moment(string[0], "MM/DD/YYYY").startOf('d')
      data.callEndTime = _moment(string[1], "MM/DD/YYYY").endOf('d')
    }

    if (effectiveTime && Number(effectiveTimeType) == CONST_EFFECTIVE_TIME_TYPE.ABOUT_DAY.value) {
      let string = effectiveTime.split(' - ')

      data.effectiveTimeStart = _moment(string[0], "MM/DD/YYYY").startOf('d')
      data.effectiveTimeEnd = _moment(string[1], "MM/DD/YYYY").endOf('d')

      const currentDate = _moment(new Date(), "MM/DD/YYYY").startOf('d').valueOf()
      const effectiveTimeStartTemp = _moment(string[0], "MM/DD/YYYY").startOf('d').valueOf()

      if (effectiveTimeStartTemp <= currentDate) data.status = CONST_STATUS.ACTIVE.value
    }

    if (numberOfCall) {
      data.numberOfCall = Math.abs(numberOfCall)
    }
    // check tồn tại của tên mục tiêu
    const foundScoreTargetName = await model.ScoreTarget.findOne({ where: { name: name } })
    if (foundScoreTargetName) throw new Error(MESSAGE_ERROR['QA-002'])

    data.created = req.user.id

    let _data = await model.ScoreTarget.create(data, { transaction: transaction })

    if (_data && _data.id) {
      data.scoreTargetId = _data.id

      if (arrCond) {
        arrCond.map((el) => {
          if (el.cond && CONST_COND[el.cond].p == 'only number') {
            let checkNum = isNaN(el.value) ? true : false
            if (checkNum || parseInt(el.value) < 0) throw new Error('Giá trị nhập phải là định dạng số >= 0')
          }
          el.scoreTargetId = _data.id
        })
        await model.ScoreTargetCond.bulkCreate(arrCond, { transaction: transaction })
      }

      if (arrTargetAuto && arrTargetAuto.length > 0) {

        let p = []
        arrTargetAuto.forEach(function (el, index) {
          el.scoreTargetId = _data.id
          p.push(model.ScoreTargetAuto.create(
            el, { transaction: transaction }))
        })

        let result = await Promise.all(p)

        let _p = []
        result.forEach(function (elm, i) {
          if (arrTargetAuto[i].keyword && arrTargetAuto[i].keyword.length > 0) {
            let arrKeyword = arrTargetAuto[i].keyword
            arrKeyword.forEach((el) => {
              el.targetAutoId = elm.id
            })
            _p.push(model.ScoreTargetKeywordSet.bulkCreate(arrKeyword, { transaction: transaction }))
          }
        })
        await Promise.all(_p)
      }

      if (scoreScriptId && scoreScriptId.length > 0) {
        let arr = []
        scoreScriptId.map((el) => {
          arr.push({
            scoreScriptId: el,
            scoreTargetId: _data.id
          })
        })
        await model.ScoreTarget_ScoreScript.bulkCreate(arr, { transaction: transaction })
      }
    }
    await transaction.commit()
    return res.status(SUCCESS_200.code).json({ message: _data })
  } catch (error) {
    _logger.error('Tạo mục tiêu bị lỗi', error)
    if (transaction) await transaction.rollback()
    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.update = async (req, res, next) => {
  let transaction
  try {
    let data = req.body
    const { callTime, name, effectiveTime, effectiveTimeType, arrCond, arrTargetAuto, scoreScriptId, numberOfCall, status } = req.body
    transaction = await model.sequelize.transaction()

    const foundScoreTarget = await model.ScoreTarget.findOne({ where: { id: { [Op.eq]: data['edit-id'] } } })
    if (parseInt(status) < parseInt(foundScoreTarget.status)) throw new Error(statusUpdateFail)

    if (callTime) {
      let string = callTime.split(' - ')
      data.callStartTime = _moment(string[0], "MM/DD/YYYY").startOf('d')
      data.callEndTime = _moment(string[1], "MM/DD/YYYY").endOf('d')
    }

    if (effectiveTime && effectiveTimeType == CONST_EFFECTIVE_TIME_TYPE.ABOUT_DAY.value) {
      let string = effectiveTime.split(' - ')
      data.effectiveTimeStart = _moment(string[0], "MM/DD/YYYY").startOf('d')
      data.effectiveTimeEnd = _moment(string[1], "MM/DD/YYYY").endOf('d')

      const currentDate = _moment(new Date(), "MM/DD/YYYY").startOf('d').valueOf()
      const effectiveTimeStartTemp = _moment(string[0], "MM/DD/YYYY").startOf('d').valueOf()

      if (effectiveTimeStartTemp <= currentDate) data.status = CONST_STATUS.ACTIVE.value
    }

    // check trùng tên mục tiêu
    const foundScoreTargetName = await model.ScoreTarget.findOne({ where: { name: name, id: { [Op.ne]: data['edit-id'] } } })
    if (foundScoreTargetName) throw new Error(MESSAGE_ERROR['QA-002'])
    if (numberOfCall) {
      data.numberOfCall = Math.abs(numberOfCall)
    }
    data.updated = req.user.id

    // update tiêu chí
    await model.ScoreTarget.update(data, { where: { id: Number(data['edit-id']) } }, { transaction: transaction })

    // xóa hết bảng Điều kiện với ID tiêu chí đang update
    await model.ScoreTargetCond.destroy({ where: { scoreTargetId: Number(data['edit-id']) } }, { transaction: transaction })

    // xóa hết bảng chấm điểm hiện tại với ID tiêu chí đang update
    await model.ScoreTargetAuto.destroy({ where: { scoreTargetId: Number(data['edit-id']) } }, { transaction: transaction })

    // check và tạo các Điều kiện mới 
    if (arrCond) {
      arrCond.map((el) => {
        if (el.cond && CONST_COND[el.cond].p == 'only number') {
          let checkNum = isNaN(el.value) ? true : false
          if (checkNum || parseInt(el.value) < 0) throw new Error('Giá trị nhập phải là định dạng số >= 0')
        }
        el.scoreTargetId = Number(data['edit-id'])
      })
      await model.ScoreTargetCond.bulkCreate(arrCond, { transaction: transaction })
    }

    if (arrTargetAuto && arrTargetAuto.length > 0) {
      let p = []
      arrTargetAuto.forEach(function (el, index) {
        el.scoreTargetId = Number(data['edit-id'])
        p.push(model.ScoreTargetAuto.create(el, { transaction: transaction }))
      })

      let result = await Promise.all(p)

      let _p = []
      result.forEach(function (elm, i) {
        if (arrTargetAuto[i].keyword && arrTargetAuto[i].keyword.length > 0) {
          let arrKeyword = arrTargetAuto[i].keyword
          arrKeyword.forEach((el) => {
            el.targetAutoId = elm.id
          })
          _p.push(model.ScoreTargetKeywordSet.bulkCreate(arrKeyword, { transaction: transaction }))
        }
      })
      await Promise.all(_p)
    }


    if (scoreScriptId && scoreScriptId.length > 0) {
      let arr = []
      scoreScriptId.map((el) => {
        arr.push({
          scoreScriptId: el,
          scoreTargetId: data['edit-id']
        })
      })
      await model.ScoreTarget_ScoreScript.destroy({ where: { scoreTargetId: Number(data['edit-id']) } }, { transaction: transaction })
      await model.ScoreTarget_ScoreScript.bulkCreate(arr, { transaction: transaction })
    }
    await transaction.commit()
    return res.status(SUCCESS_200.code).json({ message: MESSAGE_ERROR['QA-006'] })
  } catch (error) {
    _logger.error('Update mục tiêu bị lỗi', error)
    if (transaction) await transaction.rollback()
    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.updateStatus = async (req, res) => {
  let transaction
  try {
    const { id } = req.params
    const { status } = req.body

    const findDocUpdate = await model.ScoreTarget.findOne({ where: { id: id } })

    if (!findDocUpdate) throw new Error(scoreTargetNotFound)

    if (findDocUpdate.status > status) throw new Error(statusUpdateFail)

    transaction = await model.sequelize.transaction()
    await model.ScoreTarget.update({ status: status }, { where: { id: id } }, { transaction: transaction })

    await transaction.commit()

    return res.json({ code: SUCCESS_200.code })

  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    if (transaction) await transaction.rollback()
    return res.json({ message: error.message, code: ERR_500.code })
  }
}

exports.assignment = async (req, res) => {
  try {
    const { id } = req.params
    const { assignment } = req.body

    //xóa các user đã được phân công trước đó
    await model.ScoreTargetAssignment.destroy({ where: { scoreTargetId: id } })

    Promise.all(assignment.map(async el => {
      await model.ScoreTargetAssignment.create({ userId: el, scoreTargetId: id })
    }))

    return res.json({ code: SUCCESS_200.code })

  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return res.json({ message: error.message, code: ERR_500.code })
  }
}

exports.replication = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id || id == '') {
      throw new Error('Bản ghi sao chép không tồn tại!')
    }

    const scoreScript = await model.ScoreScript.findAll({
      where: { status: CONST_STATUS.ACTIVE.value },
      attributes: ['name', 'id'],
      raw: true,
      nest: true
    })

    let detail = await model.ScoreTarget.findOne({
      where: { id: { [Op.eq]: Number(id) } },
      nest: true,
      raw: true,
    })
    delete detail.name
    delete detail.id
    detail.status = 0
    let [ScoreTargetAuto, ScoreTargetCond, ScoreTarget_ScoreScript, users, teams, groups, listUserAssignment, userAssigned] = await Promise.all([
      model.ScoreTargetAuto.findAll({
        where: { scoreTargetId: { [Op.eq]: Number(id) } },
        include: [
          { model: model.ScoreTargetKeywordSet, as: 'KeywordSet' },
        ],
        order: [
          ['id', 'DESC'],
        ],
        nest: true,
      }),
      model.ScoreTargetCond.findAll({ where: { scoreTargetId: { [Op.eq]: Number(id) } } }),
      model.ScoreTarget_ScoreScript.findAll({ where: { scoreTargetId: { [Op.eq]: Number(id) } } }),
      model.User.findAll({ where: { isActive: 1 } }),
      model.Team.findAll({ where: { status: TeamStatus.ON, name: { [Op.ne]: 'Default' } } }),
      model.Group.findAll({}),
      getListUserAssignment(),
      model.ScoreTargetAssignment.findAll({ where: { scoreTargetId: id } }),
    ])

    return _render(req, res, 'scoreTarget/target', {
      titlePage: null,
      scoreScript: scoreScript.length > 0 ? scoreScript : [],
      ScoreTarget: detail,
      ScoreTargetAuto: ScoreTargetAuto,
      ScoreTargetCond: ScoreTargetCond,
      ScoreTarget_ScoreScript: ScoreTarget_ScoreScript,
      CONST_RATING_BY,
      CONST_CALL_TYPE,
      CONST_EFFECTIVE_TIME_TYPE,
      CONST_STATUS,
      CONST_DATA,
      CONST_COND,
      users,
      teams,
      groups,
      isEdit: false,
      listUserAssignment,
      userAssigned
    })
  } catch (error) {
    _logger.error(`------- error ------- `)
    _logger.error(error)
    return next(error)
  }
}

async function getListUserAssignment() {
  const findRuleScoreScript = await model.Rule.findOne({ where: { code: { [Op.eq]: SYSTEM_RULE.CHAM_DIEM_CUOC_GOI.code } } })
  if (!findRuleScoreScript) return []

  const findRuleDetailScoreScript = await model.RuleDetail.findAll({ where: { [Op.and]: [{ ruleId: { [Op.eq]: findRuleScoreScript.id } }, { unLimited: { [Op.eq]: true } }] }, raw: true })
  if (!findRuleDetailScoreScript.length) return []

  const roleScoreScriptIds = _.pluck(findRuleDetailScoreScript, 'role')
  const userRole = await model.UserRole.findAll({ where: { role: { [Op.in]: roleScoreScriptIds } }, raw: true })
  if (!userRole.length) return []
  const idsUserReview = _.pluck(userRole, 'userId')
  _logger.info('List idUser assign', _.removeElementDuplicate(idsUserReview))
  return model.User.findAll({
    where: { isActive: 1, id: { [Op.in]: _.removeElementDuplicate(idsUserReview) } },
    attributes: ['id', 'fullName', 'userName'],
    include: [{
      model: UserRoleModel,
      as: 'roles',
      attributes: ['id', 'userId']
    }]
  })
}