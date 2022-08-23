
const { Op, QueryTypes } = require('sequelize')
const pagination = require('pagination')
const UserModel = require('../models/user')
const UserRoleModel = require('../models/userRole')
const titlePage = 'Nhiệm vụ chấm điểm'
const {
    SUCCESS_200,
    ERR_500,
    ERR_400,
    ERR_403
} = require("../helpers/constants/statusCodeHTTP")

const {
    CONST_COND,
    CONST_DATA,
    CONST_STATUS } = require('../helpers/constants/index')

const { headerDefault } = require('../helpers/constants/fieldScoreMission')

const { cheSo } = require("../helpers/functions")

const model = require('../models')
const moment = require('moment')

exports.index = async (req, res, next) => {
    try {

        const scoreTarget = await model.ScoreTarget.findAll({
            where: { status: CONST_STATUS['Hoạt động'] },
            attributes: ['name', 'id'],
            raw: true,
            nest: true
        })
        return _render(req, res, 'scoreMission/index', {
            scoreTarget: scoreTarget,
            title: titlePage,
            titlePage: titlePage,
            headerDefault: headerDefault
        })
    } catch (error) {
        console.log(`------- error ------- `)
        console.log(error)
        console.log(`------- error ------- `)
        return next(error)
    }
}

exports.getScoreMission = async (req, res, next) => {
    try {
        let {
            page,
            limit,
            scoreTargetId
        } = req.query

        if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

        limit = Number(limit)

        const pageNumber = page ? Number(page) : 1
        const offset = (pageNumber * limit) - limit
        let query = {
            [Op.and]: [
                { caller: { [Op.ne]: null } },
                { called: { [Op.ne]: null } }
            ],
        }
        if (scoreTargetId) {
            let data = await model.ScoreTargetCond.findAll({
                where: { scoreTargetId: { [Op.eq]: Number(scoreTargetId) } },
                raw: true,
                nest: true
            })
            if (data.length > 0) {
                data.map((el) => {
                    let _data = {}
                    _data[`${el.data}`] = { [Op[`${CONST_COND[el.cond].n}`]]: Number(el.value), }
                    query[Op[data[0].conditionSearch]].push(_data)
                })
            }
        }
        const { count, rows } = await model.CallDetailRecords.findAndCountAll({
            where: query,
            order: [
                ['id', 'DESC'],
            ],
            include: [
                { model: model.User, as: 'agent' },
                { model: model.Team, as: 'team' },
            ],
            offset: offset,
            limit: limit,
            raw: true,
            nest: true
        })

        const scoreScripts = await model.ScoreTarget_ScoreScript.findAll({
            where: {
                scoreTargetId: { [Op.eq]: Number(scoreTargetId) },
            },
            include: [
                {
                    model: model.ScoreScript,
                    as: 'ScoreScripts',
                    where: { status: 1 },
                }
            ],
            nest: true
        })

        let paginator = new pagination.SearchPaginator({
            current: pageNumber,
            rowsPerPage: limit,
            totalResult: count
        })
        
        let configurationColums = await getConfigurationColums(req.user.id)
        return res.status(SUCCESS_200.code).json({
            message: 'Success!',
            data: handleData(rows, _config.privatePhoneNumberWebView) || [],
            scoreScripts: scoreScripts,
            configurationColums: configurationColums,
            paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
        })
    } catch (error) {
        _logger.error("Lấy danh sách Nhiệm vụ chấm điểm lỗi", error)
        return res.status(ERR_500.code).json({ message: error.message })
    }
}

exports.getDetailScoreScript = async (req, res, next) => {
    try {
        const { id } = req.query

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

        return res.json({
            code: SUCCESS_200.code,
            data: scoreScriptInfo || [],
        })
    } catch (error) {
        return res.json({ code: ERR_500.code, message: error.message })
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
        const result = await model.ConfigurationColums.update(
            data,
            { where: { userId: Number(req.user.id), nameTable: titlePage } },
            { transaction: transaction }
        )
        if (result[0] == 0) {
            await model.ConfigurationColums.create(data, { transaction: transaction })
        }
        await transaction.commit()
        return res.status(SUCCESS_200.code).json({
            message: 'Success!',
        })
    } catch (error) {
        _logger.error("Lưu tùy chỉnh bảng lỗi: ", error)
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
        _logger.error("Xoá tùy chỉnh bảng bị lỗi: ", error)
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

function handleData(data, privatePhoneNumber = false) {
    let newData = []

    newData = data.map((el) => {
        el.origTime = moment(el.origTime * 1000).format('HH:mm:ss DD/MM/YYYY')
        el.duration = hms(el.duration)
        el.recordingFileName = _config.pathRecording + el.recordingFileName

        // che số
        if (privatePhoneNumber) {
            if (el.caller && el.caller.length >= 10) el.caller = cheSo(el.caller, 4)
            if (el.called && el.called.length >= 10) el.called = cheSo(el.called, 4)
        }

        return el
    })

    return newData
}

function hms(secs) {
    if (isNaN(secs) || !secs || secs == 0) return '00:00:00'

    let sec = 0
    let minutes = 0
    let hours = 0

    sec = Math.ceil(secs)
    minutes = Math.floor(sec / 60)
    sec = sec % 60
    hours = Math.floor(minutes / 60)
    minutes = minutes % 60

    return `${hours}:${pad(minutes)}:${pad(sec)}`
}

function pad(num) {
    return ('0' + num).slice(-2)
}