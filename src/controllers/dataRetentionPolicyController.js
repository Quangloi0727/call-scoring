const titlePage = 'Chính sách dữ liệu'
const {
  TypeDateSaveForCall,
  UnlimitedSaveForCall,
  STATUS,
  khongTimThayChinhSachDuLieu,
  doiNguTrongChinhSachDaTonTai,
  thayDoiTrangThaiThanhCong,
  xoaChinhSachThanhCong,
  MESSAGE_ERROR,
  TeamStatus
} = require('../helpers/constants/index')
const { Op } = require('sequelize')
const model = require('../models')
const pagination = require('pagination')
const { SUCCESS_200, ERR_400 } = require("../helpers/constants/statusCodeHTTP")
exports.index = async (req, res, next) => {
  try {

    return _render(req, res, 'dataRetentionPolicy/index', {
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

exports.getDetail = async (req, res, next) => {
  try {
    const id = req.params.id
    const query = {
      where: {
        id: id
      }
    }
    const dataRetentionPolicy = await queryDataRetentionPolicy(query)

    const teams = await model.Team.findAll({
      where: {
        status: TeamStatus.ON
      }
    })

    return _render(req, res, 'dataRetentionPolicy/edit', {
      title: titlePage,
      titlePage: titlePage,
      STATUS,
      TypeDateSaveForCall,
      UnlimitedSaveForCall,
      teams: teams,
      dataRetentionPolicy: dataRetentionPolicy[0].dataValues
    })
  } catch (error) {
    _logger.error("get chi tiết chính sách dữ liệu", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.getReplication = async (req, res, next) => {
  try {
    const id = req.params.id
    const query = {
      where: {
        id: id
      }
    }
    const dataRetentionPolicy = await queryDataRetentionPolicy(query)

    const teams = await model.Team.findAll({
      where: {
        status: TeamStatus.ON
      }
    })

    return _render(req, res, 'dataRetentionPolicy/replication', {
      title: titlePage,
      titlePage: titlePage,
      STATUS,
      TypeDateSaveForCall,
      UnlimitedSaveForCall,
      teams: teams,
      dataRetentionPolicy: dataRetentionPolicy[0].dataValues
    })
  } catch (error) {
    _logger.error("get Replication", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}
exports.getDataRetentionPolicies = async (req, res, next) => {
  try {
    const { nameDataRetentionPolicy } = req.query
    const { limit, page } = req.query

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * Number(limit)) - Number(limit)

    const query = {}
    if (nameDataRetentionPolicy) {
      query.nameDataRetentionPolicy = {
        [Op.like]: '%' + nameDataRetentionPolicy + '%'
      }
    }

    const rows = await queryDataRetentionPolicy(query, offset, Number(limit))

    const count = await model.DataRetentionPolicy.count({
      where: query ? query : {}
    });
    const paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: count,
    })

    return res.json({
      code: SUCCESS_200.code,
      data: rows || [],
      paginator: {
        ...paginator.getPaginationData(),
        rowsPerPage: limit
      }
    })
  } catch (error) {
    _logger.error("Lấy danh sách chính sách dữ liệu", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.new = async (req, res, next) => {
  try {
    const teams = await model.Team.findAll({
      where: {
        status: TeamStatus.ON
      }
    })
    return _render(req, res, 'dataRetentionPolicy/new', {
      title: titlePage,
      titlePage: titlePage,
      TypeDateSaveForCall,
      UnlimitedSaveForCall,
      teams: teams,
    })
  } catch (error) {
    _logger.error("render tạo mới chính sách dữ liệu", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.save = async (req, res, next) => {
  let transaction
  try {
    let dataCreate = req.body
    transaction = await model.sequelize.transaction()
    dataCreate.status = STATUS.UN_ACTIVE.value
    dataCreate.created = req.user.id
    dataCreate.updated = req.user.id

    // check tồn tại của tên mục tiêu
    const checkName = await model.DataRetentionPolicy.findOne({ where: { nameDataRetentionPolicy: dataCreate.nameDataRetentionPolicy } })
    if (checkName) throw new Error(MESSAGE_ERROR['QA-002'])

    const dataRetentionPolicy = await model.DataRetentionPolicy.create(dataCreate, { transaction: transaction })

    if (dataCreate.teamId && dataCreate.teamId.length > 0) {
      let dataRetentionPolicy_Teams = []
      dataCreate.teamId.forEach(el => {
        dataRetentionPolicy_Teams.push({
          teamId: el,
          dataRetentionPolicyId: dataRetentionPolicy.id
        })
      })
      await model.DataRetentionPolicyTeam.bulkCreate(dataRetentionPolicy_Teams, { transaction: transaction })
    }
    await transaction.commit()
    return res.json({ code: SUCCESS_200.code })
  } catch (error) {
    _logger.error("tạo mới chính sách dữ liệu", error)
    if (transaction) await transaction.rollback()
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.update = async (req, res, next) => {
  let transaction
  try {
    const dataUpdate = req.body
    const id = req.params.id
    transaction = await model.sequelize.transaction()

    dataUpdate.updated = req.user.id

    // check tồn tại của tên mục tiêu
    const checkName = await model.DataRetentionPolicy.findOne({
      where: {
        nameDataRetentionPolicy: dataUpdate.nameDataRetentionPolicy,
        id: {
          [Op.ne]: id
        }
      }
    })
    if (checkName) throw new Error(MESSAGE_ERROR['QA-002'])

    await model.DataRetentionPolicy.update(
      dataUpdate,
      {
        where: { id: id }
      },
      { transaction: transaction }
    )

    if (dataUpdate.teamId && dataUpdate.teamId.length > 0) {
      let dataRetentionPolicy_Teams = []
      dataUpdate.teamId.forEach(el => {
        dataRetentionPolicy_Teams.push({
          teamId: el,
          dataRetentionPolicyId: id
        })
      })
      await model.DataRetentionPolicyTeam.destroy({ where: { dataRetentionPolicyId: id } }, { transaction: transaction })
      await model.DataRetentionPolicyTeam.bulkCreate(dataRetentionPolicy_Teams, { transaction: transaction })
    }
    await transaction.commit()
    return res.json({ code: SUCCESS_200.code })
  } catch (error) {
    _logger.error("cập nhật chính sách dữ liệu", error)
    if (transaction) await transaction.rollback()
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.delete = async (req, res) => {
  let transaction
  try {
    const id = req.params.id
    transaction = await model.sequelize.transaction()
    await model.DataRetentionPolicy.destroy({ where: { id: id } }, { transaction: transaction })
    await model.DataRetentionPolicyTeam.destroy({ where: { dataRetentionPolicyId: id } }, { transaction: transaction })
    await transaction.commit()
    return res.json({ code: SUCCESS_200.code, message: xoaChinhSachThanhCong })
  } catch (error) {
    _logger.error("xóa chính sách dữ liệu", error)
    if (transaction) await transaction.rollback()
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.getTeamByIds = async (req, res) => {
  try {
    let { teamIds } = req.query
    const listData = await model.Team.findAll({
      where: {
        id: teamIds.split(","),
        status: TeamStatus.ON
      }
    })

    return res.json({
      code: SUCCESS_200.code,
      data: listData
    })
  } catch (error) {
    _logger.error("Lấy danh sách team theo ds team ID", error)
    return res.json({ code: ERR_400.code, message: error.message })
  }
}

exports.updateStatus = async (req, res) => {
  let transaction
  try {
    const { status, id } = req.body

    const findDocUpdate = await model.DataRetentionPolicy.findAll({
      where: { id: id },
      include: [
        {
          model: model.DataRetentionPolicyTeam,
          as: 'DataRetentionPolicyTeam',
          attributes: ['id', 'teamId']
        },
      ],
      nest: true,
      raw: true,
    })
    if (!findDocUpdate) throw new Error(khongTimThayChinhSachDuLieu)

    const teams = _.uniq(_.pluck(findDocUpdate, 'DataRetentionPolicyTeam'));
    const teamIds = _.uniq(_.pluck(teams, 'teamId'));

    if (teamIds && teamIds.length > 0 && findDocUpdate[0].status == STATUS.UN_ACTIVE.value) {
      const check = await model.DataRetentionPolicy.findAll({
        where: {
          status: STATUS.ACTIVE.value,
          id: { [Op.ne]: id }
        },
        include: [
          {
            model: model.DataRetentionPolicyTeam,
            as: 'DataRetentionPolicyTeam',
            where: {
              teamId: teamIds,
            }
          },
        ],
      })

      if (check && check.length > 0) throw new Error(doiNguTrongChinhSachDaTonTai)
    }

    transaction = await model.sequelize.transaction()
    await model.DataRetentionPolicy.update({ status: status }, { where: { id: id } }, { transaction: transaction })

    await transaction.commit()

    return res.json({ code: SUCCESS_200.code, message: thayDoiTrangThaiThanhCong })

  } catch (error) {
    _logger.error("update status", error)
    if (transaction) await transaction.rollback()
    return res.json({ message: error.message, code: ERR_400.code })
  }
}

async function queryDataRetentionPolicy(query, offset, limit) {
  try {
    const _query = {
      where: query ? query.where : {},
      include: [
        { model: model.User, as: 'userCreate' },
        { model: model.User, as: 'userUpdate' },
        {
          model: model.DataRetentionPolicyTeam,
          as: 'DataRetentionPolicyTeam',
          include: [{ model: model.Team, as: 'TeamInfo' }]
        },
      ],
    }
    if (offset) _query.offset = offset
    if (limit) _query.limit = limit
    const data = await model.DataRetentionPolicy.findAll(_query)
    return data
  } catch (error) {
    return error
  }
}
