const { SUCCESS_200, ERR_500 } = require("../helpers/constants/statusCodeHTTP")
const { SOURCE_NAME, idExist, nameExist, hostPortExist, sourceNotExist, ENABLED } = require('../helpers/constants/manageSourceRecord')
const pagination = require('pagination')
const titlePage = 'Quản lý nguồn ghi âm'
const model = require('../models')
const { Op } = require('sequelize')

const { requestSource } = require('../common/funtionsAPI/sourceAPI')
exports.index = async (req, res, next) => {
    try {
        return _render(req, res, 'manageSourceRecord/index', {
            titlePage,
            SOURCE_NAME,
            ENABLED
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

        let findList = model.manageSource.findAll({
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

        let count = model.manageSource.count({ where: _query })

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

        const checkExistId = await model.manageSource.findOne({ where: { id: id } })
        if (checkExistId) throw new Error(idExist)

        const checkNameExist = await model.manageSource.findOne({ where: { sourceName: sourceName } })
        if (checkNameExist) throw new Error(nameExist)

        const checkExistPortHost = await model.manageSource.findOne({ where: { dbHost: dbHost, dbPort: dbPort } })
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

        const manageSource = await model.manageSource.create(req.body)

        // request tạo source theo api
        var config = {
            method: 'post',
            url: _config.pathUrlSource + '/source',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const _source = await requestSource(req.body, config)
        manageSource.set({
            sourceId: _source.data.id
        });
        await manageSource.save();

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
        const findSource = await model.manageSource.findOne({ where: { id: id } })
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

        const checkNameExist = await model.manageSource.findOne({ where: { sourceName: sourceName, id: { [Op.ne]: id } } })
        if (checkNameExist) throw new Error(nameExist)

        const checkExistPortHost = await model.manageSource.findOne({ where: { dbHost: dbHost, dbPort: dbPort, id: { [Op.ne]: id } } })
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
        const source = await model.manageSource.findOne({ where: { id: id } })
        const updateSource = await model.manageSource.update(req.body, { where: { id: id } })
        // request tạo source theo api
        var config = {
            method: 'put',
            url: _config.pathUrlSource + '/source/' + source.sourceId,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        await requestSource(req.body, config);
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

        let updateSource = await model.manageSource.update(req.body, { where: { id: id } }, { transaction: transaction })
        let status = 'disable'
        const source = await model.manageSource.findOne({ where: { id: id } })
        if (updateSource.enable == 1) {
            status += 'enable'
        }
        var config = {
            method: 'put',
            url: _config.pathUrlSource + '/source/' + source.sourceId + '/' + status,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        await requestSource(null, config);
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