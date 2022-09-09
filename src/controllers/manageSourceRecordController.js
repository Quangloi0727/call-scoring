const { SUCCESS_200, ERR_500 } = require("../helpers/constants/statusCodeHTTP")
const { SOURCE_NAME, idExist, nameExist } = require('../helpers/constants/manageSourceRecord')
const titlePage = 'Quản lý nguồn ghi âm'
const model = require('../models')

exports.index = async (req, res, next) => {
    try {

        return _render(req, res, 'manageSourceRecord/index', {
            titlePage,
            SOURCE_NAME
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

        let _query = {}

        if (sourceName) {
            _query.sourceName = {}
            _query.sourceName.$like = `%${sourceName}%`
        }

        const pageNumber = page ? Number(page) : 1
        const offset = (pageNumber * limit) - limit

        let findList = model.dbSource.findAll({
            where: _query,
            order: [['updateAt', 'DESC']],
            limit: pageNumber,
            offset: offset
        })

        let count = model.dbSource.count({ where: _query })

        const [listData, totalRecord] = await Promise.all([findList, count])

        let paginator = new pagination.SearchPaginator({
            current: pageNumber,
            listData: listData,
            rowsPerPage: limit,
            totalResult: totalRecord
        })

        return res.json({
            code: SUCCESS_200.code,
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
        const { id, sourceType, sourceName } = req.body

        const checkExistId = await model.dbSource.findOne({ where: { id: id } })
        if (checkExistId) throw new Error(idExist)

        const checkNameExist = await model.dbSource.findOne({ where: { sourceName: sourceName } })
        if (checkNameExist) throw new Error(nameExist)

        for (var pro in SOURCE_NAME) {
            if (SOURCE_NAME[pro].code == sourceType) {
                req.body.tableInclude = SOURCE_NAME[pro].tableInclude
                req.body.sourceType = SOURCE_NAME[pro].text
                break
            }
        }

        req.body.lastUpdateTime = _moment(new Date()).valueOf()

        await model.dbSource.create(req.body)

        return res.json({ code: SUCCESS_200.code, message: "Lưu thành công !" })

    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        _logger.error(`------- error ------- `)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}