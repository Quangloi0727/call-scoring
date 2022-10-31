const { SUCCESS_200, ERR_500 } = require("../helpers/constants/statusCodeHTTP")
const { SOURCE_NAME, idExist, nameExist, hostPortExist, sourceNotExist, ENABLED } = require('../helpers/constants/manageSourceRecord')
const pagination = require('pagination')
const titlePage = 'Quản lý nguồn ghi âm'
const model = require('../models')
const { Op } = require('sequelize')
const axios = require('axios')
const { NodeSSH } = require('node-ssh')
const ssh = new NodeSSH()

exports.index = async (req, res, next) => {
    try {
        const fileServer = await model.FileServer.findOne()
        return _render(req, res, 'manageSourceRecord/index', {
            titlePage,
            SOURCE_NAME,
            ENABLED,
            fileServer: (fileServer ? fileServer.dataValues : "")
        })
    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        _logger.error(`------- error ------- `)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}
exports.getListSource = async (req, res, next) => {
    try {
        let { page, limit, sourceName } = req.query

        if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE
        limit = Number(limit)

        let _query = {}

        if (sourceName) {
            _query.sourceName = {}
            _query.sourceName[Op.like] = `%${sourceName}%`
        }

        const pageNumber = page ? Number(page) : 1
        const offset = (pageNumber * limit) - limit

        let findList = model.ManageSource.findAll({
            where: _query,
            include: [
                {
                    model: model.User,
                    as: 'userCreate'
                },
                {
                    model: model.User,
                    as: 'userUpdate'
                },
            ],
            order: [['updatedAt', 'DESC']],
            offset: offset,
            limit: limit
        })

        let count = model.ManageSource.count({ where: _query })

        const [listData, totalRecord] = await Promise.all([findList, count])

        let paginator = new pagination.SearchPaginator({
            current: pageNumber,
            rowsPerPage: limit,
            totalResult: totalRecord
        })

        return res.json({
            code: SUCCESS_200.code,
            listData: listData,
            message: 'Success!',
            paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
        })
    } catch (error) {
        _logger.error("get list source record", error)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}

exports.create = async (req, res, next) => {
    try {
        const { id, sourceType, sourceName, dbHost, dbPort } = req.body

        const checkExistId = await model.ManageSource.findOne({ where: { id: id } })
        if (checkExistId) throw new Error(idExist)

        const checkNameExist = await model.ManageSource.findOne({ where: { sourceName: sourceName } })
        if (checkNameExist) throw new Error(nameExist)

        const checkExistPortHost = await model.ManageSource.findOne({ where: { dbHost: dbHost, dbPort: dbPort } })
        if (checkExistPortHost) throw new Error(hostPortExist)

        for (var pro in SOURCE_NAME) {
            if (SOURCE_NAME[pro].code == sourceType) {
                req.body.tableInclude = SOURCE_NAME[pro].tableInclude
                req.body.sourceType = SOURCE_NAME[pro].text
                break
            }
        }

        req.body.created = req.user.id
        req.body.updated = req.user.id
        req.body.lastUpdateTime = _moment(new Date()).valueOf()

        const manageSource = await model.ManageSource.create(req.body)

        // request tạo source theo api
        const response = await axios.post(_config.pathUrlSource + '/source', req.body, { headers: { 'Content-Type': 'application/json' } })

        manageSource.set({ sourceId: response.data.data.id })

        await manageSource.save()

        return res.json({ code: SUCCESS_200.code, message: "Lưu thành công !" })

    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        _logger.error(`------- error ------- `)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}

exports.detail = async (req, res, next) => {
    try {
        const { id } = req.params
        const findSource = await model.ManageSource.findOne({ where: { id: id } })
        if (!findSource) throw new Error(sourceNotExist)

        return res.json({ code: SUCCESS_200.code, data: findSource })

    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        _logger.error(`------- error ------- `)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params
        const { sourceType, sourceName, dbHost, dbPort } = req.body

        const checkNameExist = await model.ManageSource.findOne({ where: { sourceName: sourceName, id: { [Op.ne]: id } } })
        if (checkNameExist) throw new Error(nameExist)

        const checkExistPortHost = await model.ManageSource.findOne({ where: { dbHost: dbHost, dbPort: dbPort, id: { [Op.ne]: id } } })
        if (checkExistPortHost) throw new Error(hostPortExist)

        for (var pro in SOURCE_NAME) {
            if (SOURCE_NAME[pro].code == sourceType) {
                req.body.tableInclude = SOURCE_NAME[pro].tableInclude
                req.body.sourceType = SOURCE_NAME[pro].text
                break
            }
        }

        req.body.updated = req.user.id
        req.body.lastUpdateTime = _moment(new Date()).valueOf()

        await model.ManageSource.update(req.body, { where: { id: id } })

        // request tạo source theo api
        const source = await model.ManageSource.findOne({ where: { id: id } })

        await axios.put(_config.pathUrlSource + '/source/' + source.sourceId, req.body, { headers: { 'Content-Type': 'application/json' } })

        return res.json({ code: SUCCESS_200.code, message: "Lưu thành công !" })
    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        _logger.error(`------- error ------- `)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}

exports.updateStatus = async (req, res, next) => {
    let transaction
    try {
        const { id } = req.params
        transaction = await model.sequelize.transaction()
        req.body.updated = req.user.id
        req.body.lastUpdateTime = _moment(new Date()).valueOf()

        await model.ManageSource.update(req.body, { where: { id: id } }, { transaction: transaction })

        const source = await model.ManageSource.findOne({ where: { id: id } })

        await axios.put(_config.pathUrlSource + '/source/' + source.sourceId + '/' + genStatus(source.enabled), null, { headers: { 'Content-Type': 'application/json' } })

        await transaction.commit()

        return res.json({ code: SUCCESS_200.code, message: "Lưu thành công !" })
    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        if (transaction) await transaction.rollback()
        _logger.error(`------- error ------- `)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}

exports.saveFileServer = async (req, res) => {
    try {
        const body = req.body
        body.updated = req.user.id
        if (!body.id || body.id == "") {
            body.created = req.user.id
            await model.FileServer.create(body)
        } else {
            await model.FileServer.update(req.body, { where: { id: body.id } })
        }
        res.json({ code: SUCCESS_200.code })
    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        _logger.error(`------- error ------- `)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}

exports.checkShhFileServer = async (req, res) => {
    try {
        const { password, ipServer, username, port } = req.body
        await ssh.connect({
            host: ipServer,
            username: username,
            port: port,
            password,
            tryKeyboard: true,
        })
        res.json({ code: SUCCESS_200.code })
    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        _logger.error(`------- error ------- `)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}

function genStatus(enabled) {
    if (enabled == ENABLED.ON) return 'enable'
    if (enabled == ENABLED.OFF) return 'disable'
}
