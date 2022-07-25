const { Op, QueryTypes } = require('sequelize')
const pagination = require('pagination')
const moment = require('moment')
const _ = require('lodash')
const UserModel = require('../models/user')
const UserRoleModel = require('../models/userRole')
const model = require('../models')
const {
  SUCCESS_200,
  ERR_500,
  ERR_400
} = require("../helpers/constants/statusCodeHTTP")

const {
  USER_ROLE
} = require("../helpers/constants/statusField")

const titlePage = 'Danh sách người dùng'

exports.index = async (req, res, next) => {
  try {
    return _render(req, res, 'users/index', {
      title: titlePage,
      titlePage: titlePage,
      USER_ROLE,
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.getUsers = async (req, res, next) => {
  try {
    const { page, extension, username, fullname } = req.query
    let { limit } = req.query
    if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

    limit = Number(limit)

    const pageNumber = page ? Number(page) : 1
    const offset = (pageNumber * limit) - limit
    let query = {}
    let currentUser = req.user
    if (username) query.userName = { [Op.substring]: username }
    if (fullname) query.fullName = { [Op.substring]: fullname }
    if (extension) query.extension = { [Op.substring]: extension }

    const [recordResult, total] = await Promise.all([
      UserModel.findAll({
        where: {
          ...query,
          [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
        },
        order: [['id', 'DESC']],
        offset: offset,
        limit: limit,
        include: [
          { model: UserModel, as: 'userCreate' },
        ],
        raw: true,
        nest: true
      }),
      UserModel.count({
        where: {
          ...query,
          [Op.not]: [{ userName: { [Op.substring]: 'admin' } }]
        },
      })
    ])

    const userIds = _.map(recordResult, 'id')

    const dataResult = await handleAgentOfTeam(userIds, recordResult)

    let paginator = new pagination.SearchPaginator({
      current: pageNumber,
      rowsPerPage: limit,
      totalResult: total || 0,
    })

    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
      data: dataResult || [],
      currentUser: currentUser ? currentUser : null,
      paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return res.status(ERR_500.code).json({ message: error.message })
  }
}

async function handleAgentOfTeam(userIds, users) {
  try {
    if (!userIds || userIds.length == 0) return users

    let queryString = `
      SELECT 
	      AgentTeamMembers.userId As userId,
	      Teams.id AS teamId,
	      Teams.name AS teamName
      FROM dbo.AgentTeamMembers
      LEFT JOIN dbo.Teams ON AgentTeamMembers.teamId = Teams.id
      WHERE AgentTeamMembers.userId IN (${userIds.toString()})
      AND AgentTeamMembers.role = 0
    `

    const agentTeamMember = await model.sequelize.query(queryString, { type: QueryTypes.SELECT })

    const dataResult = users.map((user) => {
      const result = agentTeamMember.filter((agentOfTeam) => agentOfTeam.userId == user.id)
      return { ...user, ofTeams: result }
    })

    return dataResult
  } catch (error) {
    throw new Error(error)
  }
}

exports.createUser = async (req, res, next) => {
  let transaction

  try {
    const data = req.body

    transaction = await model.sequelize.transaction()

    if (data.firstName && data.firstName.length > 30) {
      throw new Error('Họ và tên đệm có độ dài không quá 30 kí tự!')
    }

    if (data.lastName && data.lastName.length > 30) {
      throw new Error('Tên có độ dài không quá 30 kí tự!')
    }

    if (data.userName && data.userName.length > 30) {
      throw new Error('Tên đăng nhập đệm có độ dài không quá 30 kí tự!')
    }

    if (data.password.trim() !== data.repeat_password.trim()) {
      throw new Error('Mật khẩu không trùng khớp!')
    }

    data.fullName = `${data.firstName.trim()} ${data.lastName.trim()}`
    data.extension = v
    data.role = 0
    data.isActive = 1
    data.created = req.user.id
    data.createAt = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss')
    data.updatedAt = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss')


    if (data.extension) {
      let foundUser = await UserModel.findOne({ where: { extension: Number(data.extension), isActive: 1 } })
      if (foundUser)
        return res.status(ERR_400.code).json({
          message: 'Extension đã được sử dụng!',
        })
    }
    const user = await UserModel.create(data, { transaction: transaction })

    if (data.roles && data.roles.length > 0) {
      const createRoles = data.roles.map((role) => {
        return {
          userId: user.id,
          role: role
        }
      })

      await UserRoleModel.bulkCreate(createRoles, { transaction: transaction })
    }

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

exports.getChangePassword = async (req, res, next) => {
  try {
    return _render(req, res, 'users/changePassword', {
      title: 'Đổi mật khẩu',
      titlePage: 'Đổi mật khẩu',
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.postChangePassword = async (req, res, next) => {
  let transaction

  try {
    const { newPassword, oldPassword } = req.body

    transaction = await model.sequelize.transaction()

    const user = await UserModel.findOne(
      {
        where: {
          id: { [Op.eq]: Number(req.user.id) },
          password: { [Op.eq]: oldPassword.trim() }
        },
      },
    )

    if (!user) {
      throw new Error('Mật khẩu không đúng, vui lòng thử lại!')
    }

    await UserModel.update(
      { password: newPassword.trim() },
      { where: { id: { [Op.eq]: Number(req.user.id) } } },
      { transaction: transaction }
    )

    await transaction.commit()

    req.logout()
    req.session.destroy()

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

exports.postResetPassWord = async (req, res, next) => {
  let transaction

  try {
    const { newPassword, idUser, adminPassword } = req.body

    transaction = await model.sequelize.transaction()
    if (adminPassword != req.user.password) {
      throw new Error('Mật khẩu xác thực không đúng, vui lòng thử lại!')
    }


    await UserModel.update(
      { password: newPassword.trim() },
      { where: { id: { [Op.eq]: Number(idUser) } } },
      { transaction: transaction }
    )

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

exports.getImportUser = async (req, res, next) => {
  try {
    return _render(req, res, 'users/importUser', {
      title: 'Nhập dữ liệu người dùng hàng loạt',
      titlePage: 'Nhập dữ liệu người dùng hàng loạt',
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.postCheckDataUser = async (req, res, next) => {
  try {
    const { names, extensions } = req.body

    const users = await UserModel.findAll({
      where: {
        [Op.or]: [
          { userName: { [Op.in]: names } },
          { extension: { [Op.in]: extensions } }
        ]
      },
      raw: true,
      nest: true
    })

    console.log('user: ', users)

    return res.status(SUCCESS_200.code).json({
      data: users,
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.postImportUser = async (req, res, next) => {
  let transaction

  try {
    const { users } = req.body
    let roleData = []

    transaction = await model.sequelize.transaction()

    let newUsers = users.map((user) => {
      return {
        firstName: user.HoVaTenDem.trim(),
        lastName: user.Ten.trim(),
        fullName: `${user.HoVaTenDem.trim()} ${user.Ten.trim()}`,
        userName: user.TenDangNhap.trim(),
        extension: user.Extension.trim(),
        password: user.MatKhau.trim(),
        created: Number(req.user.id),
      }
    })

    const createResult = await UserModel.bulkCreate(
      newUsers,
      { transaction: transaction }
    )

    createResult.forEach((user) => {
      const isFound = users.find((item) => item.TenDangNhap == user.userName)

      if (isFound) {
        roleData.push({
          userId: user.id,
          role: Number(isFound.Quyen)
        })
      }
    })

    console.log('role data: ', roleData)

    await UserRoleModel.bulkCreate(
      roleData,
      { transaction: transaction }
    )

    await transaction.commit()

    return res.status(SUCCESS_200.code).json({
      data: users,
    })
  } catch (error) {
    console.log(`------- error ------- getRecording`)
    console.log(error)
    console.log(`------- error ------- getRecording`)

    if (transaction) await transaction.rollback()

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.search = async (req, res) => {
  try {
    const { userName, id } = req.query
    const queryData = {}

    if (id) queryData.id = { [Op.eq]: Number(id.trim()) }
    if (userName) queryData.userName = { [Op.eq]: userName.trim() }

    const user = await UserModel.findOne({
      where: { ...queryData },
      include: [{ model: UserRoleModel, as: 'roles' }],
    })

    if (!user) {
      throw new Error('Người dùng không tồn tại!')
    }

    return res.status(SUCCESS_200.code).json({
      data: JSON.parse(JSON.stringify(user)),
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.postBlockUser = async (req, res, next) => {
  let transaction

  try {
    const { blockUser, idUser, adminPassword, extension } = req.body

    transaction = await model.sequelize.transaction()
    if (adminPassword != req.user.password) {
      throw new Error('Mật khẩu xác thực không đúng, vui lòng thử lại!')
    }
    if (!Number(extension)) throw new Error('Extension chưa đúng định dạng số!')

    if (extension && Number(blockUser) == 1) {
      let foundUser = await UserModel.findOne({ where: { extension: Number(extension), isActive: 1 } })
      if (foundUser)
        return res.status(ERR_400.code).json({
          message: 'Extension đã được sử dụng!',
          extension: foundUser.extension
        })
    }
    await UserModel.update(
      {
        isActive: Number(blockUser),
        extension: Number(extension)
      },
      { where: { id: { [Op.eq]: Number(idUser) } } },
      { transaction: transaction }
    )

    await transaction.commit()
    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    })
  } catch (error) {
    console.log("Khóa người dùng bị lỗi", error)
    if (transaction) await transaction.rollback()

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.updateUser = async (req, res) => {
  let transaction

  try {

    const data = req.body
    transaction = await model.sequelize.transaction()

    if (data['edit-firstName'] && data['edit-firstName'].length > 30) {
      throw new Error('Họ và tên đệm có độ dài không quá 30 kí tự!')
    }

    if (data['edit-lastName'] && data['edit-lastName'].length > 30) {
      throw new Error('Tên có độ dài không quá 30 kí tự!')
    }

    if (data['edit-userName'] && data['edit-userName'].length > 30) {
      throw new Error('Tên đăng nhập đệm có độ dài không quá 30 kí tự!')
    }
    data.firstName = data['edit-firstName']
    data.lastName = data['edit-lastName']
    data.fullName = `${data['edit-firstName'].trim()} ${data['edit-lastName'].trim()}`
    data.userName = data['edit-userName']
    data.extension = Number(data['edit-extension'])
    data.updatedAt = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss')


    if (data.extension) {
      let foundUser = await UserModel.findOne({ where: { extension: Number(data.extension), isActive: 1 } })
      if (foundUser && foundUser.id != Number(data['edit-id']))
        return res.status(ERR_400.code).json({
          message: 'Extension đã được sử dụng!',
        })
    }


    let userUpdate = await UserModel.update(
      data,
      { where: { id: Number(data['edit-id']) } },
      { transaction: transaction })
    await UserRoleModel.destroy({ where: { userId: Number(data['edit-id']) } })
    if (data['edit_roles'] && data['edit_roles'].length > 0) {
      const createRoles = data['edit_roles'].map((role) => {
        return {
          userId: Number(data['edit-id']),
          role: Number(role)
        }
      })

      await UserRoleModel.bulkCreate(createRoles, { transaction: transaction })

    }
    await transaction.commit()
    return res.status(SUCCESS_200.code).json({
      message: 'Success!',
    })
  } catch (error) {
    console.log('Update người dùng lỗi', error)
    if (transaction) await transaction.rollback()

    return res.status(ERR_500.code).json({ message: error.message })
  }
}
