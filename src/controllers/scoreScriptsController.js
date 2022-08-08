const { Op, QueryTypes } = require('sequelize')
const UserModel = require('../models/user')
const UserRoleModel = require('../models/userRole')
const model = require('../models')
const pagination = require('pagination')
const {
  SUCCESS_200,
  ERR_500,
  ERR_400
} = require("../helpers/constants/statusCodeHTTP")
const {
  USER_ROLE,
  OP_UNIT_DISPLAY,
  STATUS_SCORE_SCRIPT,
  MESSAGE_ERROR
} = require("../helpers/constants/statusField")
const { getLengthField } = require('../helpers/functions')

const titlePage = 'Kịch bản chấm điểm'

exports.index = async (req, res, next) => {
  try {
    const users = await getUserByRole(UserModel, USER_ROLE.groupmanager.n)

    return _render(req, res, 'scoreScripts/index', {
      title: titlePage,
      titlePage: titlePage,
      users: users,
      USER_ROLE,
      STATUS_SCORE_SCRIPT
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

async function getUserByRole(_model, role) {
  if (!role) throw new Error('role is required!')

  return await _model.findAll({
    where: {
      [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
    },
    include: [{
      model: UserRoleModel,
      as: 'roles',
      where: {
        role: { [Op.eq]: role }
      }
    }],
    raw: true,
    nest: true
  })
}

exports.gets = async (req, res, next) => {
  try {
    const { page, name, status } = req.query
    let { limit } = req.query
    if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

    limit = Number(limit)

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * limit) - limit
    let query = []

    if (name) {
      query.push(`ss.name LIKE '%${name}%'`)
    }
    if (status) {
      query.push(`ss.status = ${status}`)
    }

    let queryDataString = `
    SELECT
      ss.id as id,
      ss.name as name,
      case 
        when ss.status = ${STATUS_SCORE_SCRIPT.nhap.n} then  N'${STATUS_SCORE_SCRIPT.nhap.t}'
        when ss.status = ${STATUS_SCORE_SCRIPT.ngungHoatDong.n} then  N'${STATUS_SCORE_SCRIPT.ngungHoatDong.t}'
        when ss.status = ${STATUS_SCORE_SCRIPT.hoatDong.n} then  N'${STATUS_SCORE_SCRIPT.hoatDong.t}'
        else null
      end as status,
      FORMAT (DATEADD(HOUR, 7, ss.createdAt) , 'dd/MM/yyyy HH:mm:ss ') as createdAt,
      CONCAT(userCreate.fullName, ' (', userCreate.userName, ')') as created,
      FORMAT (DATEADD(HOUR, 7, ss.updatedAt) , 'dd/MM/yyyy HH:mm:ss ') as updatedAt,
      case 
        when ss.updated is not null then  CONCAT(userUpdate.fullName, ' (', userUpdate.userName, ')')
        else null
      end as updated
    FROM dbo.ScoreScripts ss
    LEFT JOIN dbo.Users userCreate -- nguoi tao
      ON ss.created = userCreate.id
          LEFT JOIN dbo.Users userUpdate -- nguoi cap nhat
      ON ss.updated = userUpdate.id
      ${query.length > 0 ? 'WHERE ' + query.join(' AND ') : ''}

      ORDER BY ss.id DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `

    let queryCountString = `
      SELECT COUNT(*) AS total
      FROM dbo.ScoreScripts ss
      ${query.length > 0 ? 'WHERE ' + query.join(' AND ') : ''}
    `

    const [result, total] = await Promise.all([
      await model.sequelize.query(queryDataString, { type: QueryTypes.SELECT }),
      await model.sequelize.query(queryCountString, { type: QueryTypes.SELECT }),
    ])

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: total && total.length || 0,
    })

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: result || [],
      paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.create = async (req, res) => {
  let transaction

  try {
    const data = req.body

    // default
    data.needImproveMin = 0

    const { scoreScripts } = req.body

    // convert to number
    Object.keys(req.body).forEach(i => {
      let listNumber = ['criteriaDisplayType', 'needImproveMax', 'passStandardMin', 'scoreDisplayType', 'standardMax', 'standardMin', 'status']
      if (listNumber.includes(i) && req.body[i] != undefined) {
        req.body[i] = Number(req.body[i])
      }
    })
    // validate nhóm kịch bản
    if (scoreScripts && scoreScripts.length > 0) {
      // neu co nhom tieu chi ma ko co tieu chi --> bao loi
      try {
        for (let i = 0; i < scoreScripts.length; i++) {

          const { criterias, nameCriteriaGroup, totalScore } = scoreScripts[i]
          if (!nameCriteriaGroup) throw new Error('Nhóm tiêu chí có tên rỗng')
          if (!criterias || criterias.length == 0) throw new Error('Nhóm tiêu chí có tiêu chí rỗng')

          // có tiêu chí mà không có lựa chọn thì báo lỗi 
          for (let i = 0; i < criterias.length; i++) {
            const { nameCriteria, selectionCriterias } = criterias[i]

            if (!nameCriteria) throw new Error('Tiêu chí có tên rỗng')
            if (!selectionCriterias || selectionCriterias.length == 0) throw new Error('Tiêu chí có lựa chọn rỗng')
          }

        }
      } catch (error) {
        console.log('validate kịch bản lỗi: ', error)
        return res.status(ERR_400.code).json({ message: MESSAGE_ERROR['QA-007'] })
      }
    }

    transaction = await model.sequelize.transaction()

    data.created = req.user.id

    if (data.name && data.name.length > getLengthField('name')) {
      throw new Error(`Tên không được dài quá ${getLengthField('name')} kí tự!`)
    }

    if (data.description && data.description.length > getLengthField('description')) {
      throw new Error(`Mô tả không được dài quá ${getLengthField('description')} kí tự!`)
    }

    if (!data.name || data.name.trim() == '') {
      throw new Error('Tên không được để trống!')
    }

    /**
     * 1. tạo kịch bản chung
     * 2. tạo nhóm tiêu chí 
     * 3. --> tạo tiêu chí
     * 4. --> tạo lựa chọn
     */
    // 1. tạo kịch bản chung
    const scoreScriptResult = await model.ScoreScript.create(data, { transaction: transaction })
    // 2. tạo nhóm tiêu chí 
    let dataCriteriaGroups = scoreScripts.map(i => {
      return {
        name: i.nameCriteriaGroup,
        scoreScriptId: scoreScriptResult.id,
        created: data.created
      }
    })
    const criteriaGroupResult = await model.CriteriaGroup.bulkCreate(dataCriteriaGroups, { transaction: transaction })
    // 3. --> tạo tiêu chí
    let dataCriterias = []

    scoreScripts.forEach((i, index) => {

      i.criterias.forEach(j => {
        dataCriterias.push({
          name: j.nameCriteria,
          scoreMax: j.scoreMax,
          isActive: j.isActive,
          criteriaGroupId: criteriaGroupResult[index].id,
          created: data.created,
          selectionCriterias: j.selectionCriterias
        })
      })

    })
    const criteriaResult = await model.Criteria.bulkCreate(dataCriterias, { transaction: transaction })

    // 3. --> tạo lựa chọn
    let dataSelectionCriterias = []
    dataCriterias.forEach((i, index) => {

      i.selectionCriterias.forEach(j => {
        dataSelectionCriterias.push({
          name: j.name,
          score: Number(j.score),
          unScoreCriteriaGroup: j.unScoreCriteriaGroup,
          unScoreScript: j.unScoreScript,
          criteriaId: criteriaResult[index].id,
          created: data.created,
        })
      })

    })

    await model.SelectionCriteria.bulkCreate(dataSelectionCriterias, { transaction: transaction })

    await transaction.commit()

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    })

  } catch (error) {
    console.log(`------- error ------- getRecording`)
    console.log(error)
    console.log(`------- error ------- getRecording`)

    if (transaction) await transaction.rollback()

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.new = async (req, res, next) => {
  try {
    let initScoreScript = {
      CriteriaGroup: []
    }

    return _render(req, res, 'scoreScripts/new', {
      titlePage: null,
      scoreScript: initScoreScript,
      OP_UNIT_DISPLAY,
      STATUS_SCORE_SCRIPT
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.detail = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id || id == '') {
      throw new Error('Nhóm không tồn tại!')
    }

    let [scoreScriptInfo] = await Promise.all([
      model.ScoreScript.findOne({
        where: { id: { [Op.eq]: Number(id) } },
        include: [
          { model: model.User, as: 'userCreate' },
          {
            model: model.CriteriaGroup,
            as: 'CriteriaGroup',
            include: {
              model: model.Criteria,
              as: 'Criteria',
              include: {
                model: model.SelectionCriteria,
                as: 'SelectionCriteria'
              },
            },
          },
        ],
        nest: true
      })
    ])


    return _render(req, res, 'scoreScripts/detail', {
      titlePage: null,
      scoreScript: scoreScriptInfo,
      OP_UNIT_DISPLAY,
      STATUS_SCORE_SCRIPT
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.update = async (req, res) => {
  let transaction

  try {
    const { description, name, id, leader } = req.body

    transaction = await model.sequelize.transaction()

    if (!name || name.trim() == '') {
      throw new Error('Tên nhóm không được để trống!')
    }

    if (!leader || leader.length <= 0) {
      throw new Error('Giát sát nhóm không được để trống!')
    }

    let dataUpdate = {}

    if (name) dataUpdate.name = name
    if (description) dataUpdate.description = description

    await model.Group.update(
      dataUpdate,
      { where: { id: Number(id) } },
      { transaction: transaction }
    )

    await model.UserGroupMember.destroy(
      { where: { groupId: Number(id), role: USER_ROLE.groupmanager.n } },
      { transaction: transaction }
    )

    let dataMember = leader.map(el => {
      return {
        groupId: id,
        userId: el,
        role: USER_ROLE.groupmanager.n
      }
    })

    await model.UserGroupMember.bulkCreate(dataMember, { transaction: transaction })

    await transaction.commit()

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)

    if (transaction) await transaction.rollback()

    return res.status(ERR_500.code).json({ message: error.message })
  }
}