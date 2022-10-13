const { Op } = require('sequelize')
const pagination = require('pagination')
const titlePage = 'Danh sách nhiệm vụ chấm điểm'
const {
    SUCCESS_200,
    ERR_500,
} = require("../helpers/constants/statusCodeHTTP")

const {
    CONST_COND,
    CONST_STATUS
} = require('../helpers/constants/index')

const { headerDefault, idCallNotFound, callHasBeenScored, timeNoteExists, CreatedByForm } = require('../helpers/constants/fieldScoreMission')

const { cheSo } = require("../helpers/functions")

const model = require('../models')
const moment = require('moment')

exports.index = async (req, res, next) => {
    try {
        const scoreTarget = await model.ScoreTarget.findAll({
            where: { status: CONST_STATUS.ACTIVE.value },
            attributes: ['name', 'id'],
            raw: true,
            nest: true
        })
        return _render(req, res, 'scoreMission/index', {
            scoreTarget: scoreTarget,
            title: titlePage,
            titlePage: titlePage,
            headerDefault: headerDefault,
            CreatedByForm
        })
    } catch (error) {
        _logger.error(`------- error ------- `)
        _logger.error(error)
        _logger.error(`------- error ------- `)
        return res.status(ERR_500.code).json({ message: error.message })
    }
}

exports.getScoreMission = async (req, res, next) => {
    try {
        let {
            page,
            limit
        } = req.query

        if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

        limit = Number(limit)

        const pageNumber = page ? Number(page) : 1
        const offset = (pageNumber * limit) - limit

        const userId = req.user.id

        let findList = model.CallShare.findAll({
            where: { assignFor: userId },
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
                }
            ],
            order: [['updatedAt', 'DESC']],
            offset: offset,
            limit: limit
        })

        let count = model.CallShare.count({ where: { assignFor: userId } })

        const [listData, totalRecord] = await Promise.all([findList, count])

        // let query = {
        //     [Op.and]: [
        //         { caller: { [Op.ne]: null } },
        //         { called: { [Op.ne]: null } }
        //     ],
        // }
        // if (scoreTargetId) {
        //     let data = await model.ScoreTargetCond.findAll({
        //         where: { scoreTargetId: { [Op.eq]: Number(scoreTargetId) } },
        //         raw: true,
        //         nest: true
        //     })
        //     if (data.length > 0) {
        //         data.map((el) => {
        //             let _data = {}
        //             _data[`${el.data}`] = { [Op[`${CONST_COND[el.cond].n}`]]: Number(el.value), }
        //             query[Op[data[0].conditionSearch]].push(_data)
        //         })
        //     }
        // }

        // let [{ rows }, { count }] = await Promise.all([
        //     // ds các bản ghi đã lấy ddc
        //     model.CallDetailRecords.findAndCountAll({
        //         where: query,
        //         include: [
        //             { model: model.User, as: 'agent' },
        //             {
        //                 model: model.Team,
        //                 as: 'team',
        //                 include: {
        //                     model: model.TeamGroup,
        //                     as: 'TeamGroup',
        //                     include: {
        //                         model: model.Group,
        //                         as: 'Group'
        //                     },
        //                 },
        //             },
        //             { model: model.CallRating, as: 'callRating' },
        //             {
        //                 model: model.CallRatingNote,
        //                 as: 'callRatingNote',
        //             },
        //             {
        //                 model: model.CallRating,
        //                 as: 'callRating',
        //                 include: {
        //                     model: model.SelectionCriteria,
        //                     as: 'SelectionCriteria'
        //                 },
        //             },
        //         ],
        //         order: [
        //             ['id', 'DESC'],
        //         ],
        //         offset: offset,
        //         limit: limit,

        //         nest: true
        //     }),
        //     //tính tổng
        //     model.CallDetailRecords.findAndCountAll({
        //         where: query,
        //         offset: offset,
        //         limit: limit,

        //         nest: true
        //     })
        // ])


        let paginator = new pagination.SearchPaginator({
            current: pageNumber,
            rowsPerPage: limit,
            totalResult: totalRecord
        })

        let configurationColums = await getConfigurationColums(req.user.id)

        return res.status(SUCCESS_200.code).json({
            message: 'Success!',
            data: handleData(listData, _config.privatePhoneNumberWebView) || [],
            configurationColums: configurationColums,
            paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
        })
    } catch (error) {
        _logger.error("Lấy danh sách Nhiệm vụ chấm điểm lỗi", error)
        return res.status(ERR_500.code).json({ message: error.message })
    }
}

exports.getCallRatingNotes = async (req, res, next) => {
    try {
        const { callId } = req.params
        if (!callId || callId == 'null' || callId == '') throw new Error(idCallNotFound)
        const result = await model.CallRatingNote.findAll({
            where: { callId: callId },
            include: [
                {
                    model: model.User,
                    as: 'userCreate'
                },
                {
                    model: model.Criteria,
                    as: 'criteria'
                },
                {
                    model: model.CriteriaGroup,
                    as: 'criteriaGroup'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })
        return res.json({ code: 200, result: result })
    } catch (error) {
        _logger.error("get list notes errors", error)
        return res.json({ code: 500, message: error })
    }
}

exports.getCallRatingHistory = async (req, res, next) => {
    try {
        const { callId } = req.params
        if (!callId || callId == 'null' || callId == '') throw new Error(idCallNotFound)
        const resultEdit = await model.CallRatingHistory.findAll({
            where: { callId: callId, type: CreatedByForm.EDIT },
            include: [
                {
                    model: model.User,
                    as: 'userCreate'
                },
                {
                    model: model.Criteria,
                    as: 'criteria'
                },
                {
                    model: model.SelectionCriteria,
                    as: 'selectionCriteriaOld'
                },
                {
                    model: model.SelectionCriteria,
                    as: 'selectionCriteriaNew'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })

        const resultAdd = await model.CallRatingHistory.findOne({
            where: { callId: callId, type: CreatedByForm.ADD },
            include: [
                {
                    model: model.User,
                    as: 'userCreate'
                }
            ]
        })

        return res.json({ code: 200, resultEdit: resultEdit, resultAdd: resultAdd })
    } catch (error) {
        _logger.error("get list call rating history", error)
        return res.json({ code: 500, message: error })
    }
}

exports.getCriteriaGroupByCallRatingId = async (req, res, next) => {
    try {
        const findCallRating = await model.CallRating.findOne({ where: { callId: req.params.callId } })
        if (!findCallRating) throw new Error(callHasBeenScored)
        const result = await model.ScoreScript.findOne({
            where: { id: { [Op.eq]: Number(findCallRating.idScoreScript) } },
            include: [
                {
                    model: model.CriteriaGroup,
                    as: 'CriteriaGroup',
                    include: {
                        model: model.Criteria,
                        as: 'Criteria'
                    }
                }
            ]
        })
        return res.json({ code: 200, result: result })
    } catch (error) {
        _logger.error("get all criteria group errors", error)
        return res.json({ code: 500, message: error })
    }
}

exports.checkScored = async (req, res, next) => {
    try {
        const result = await model.CallRating.findOne({ where: { callId: req.params.id } })
        if (result) throw new Error(callHasBeenScored)
        return res.json({ code: 200, result: result })
    } catch (error) {
        _logger.error("get check scored errors", error)
        return res.json({ code: 500, message: error })
    }
}

exports.getCriteriaByCriteriaGroup = async (req, res, next) => {
    try {
        const result = await model.Criteria.findAll({
            where: { criteriaGroupId: req.params.criteriaGroupId, isActive: 1 }
        })
        return res.json({ code: 200, result: result })
    } catch (error) {
        _logger.error("get Criteria By CriteriaGroup errors", error)
        return res.json({ code: 500, message: error })
    }
}

exports.getDetailScoreScript = async (req, res, next) => {
    try {
        const { idScoreScript, callId } = req.query

        if (!idScoreScript || idScoreScript == '') {
            throw new Error('Chưa có id kịch bản!')
        }
        let p = []
        p.push(model.ScoreScript.findOne({
            where: { id: { [Op.eq]: Number(idScoreScript) } },
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
                    }
                }
            ],
            nest: true
        }))

        if (callId) {
            p.push(model.CallRating.findAll({
                where: { callId: callId }
            }))
            p.push(model.CallRatingNote.findAll({
                where: { callId: callId },
                include: [
                    {
                        model: model.User,
                        as: 'userCreate'
                    },
                    {
                        model: model.Criteria,
                        as: 'criteria'
                    },
                    {
                        model: model.CriteriaGroup,
                        as: 'criteriaGroup'
                    }
                ],
                order: [
                    ['createdAt', 'DESC']
                ]
            }))
        }

        let [scoreScriptInfo, resultCallRating, resultCallRatingNote] = await Promise.all(p)

        return res.json({
            code: SUCCESS_200.code,
            data: scoreScriptInfo || [],
            resultCallRating: resultCallRating,
            resultCallRatingNote: resultCallRatingNote
        })
    } catch (error) {
        _logger.error("get data chi tiết kịch bản lỗi: ", error)
        return res.json({ code: ERR_500.code, message: error.message })
    }
}

exports.SaveConfigurationColums = async (req, res) => {
    try {
        const data = {}
        data.userId = req.user.id
        data.configurationColums = JSON.stringify(req.body)
        data.nameTable = titlePage

        const findConfig = await model.ConfigurationColums.findOne(
            { where: { userId: Number(req.user.id), nameTable: titlePage } }
        )

        if (findConfig) {
            await findConfig.update(data)
        } else {
            await model.ConfigurationColums.create(data)
        }
        return res.json({ message: 'Success !', code: SUCCESS_200.code })

    } catch (error) {
        _logger.error("Lưu tùy chỉnh bảng lỗi: ", error)
        return res.json({ message: error.message, code: ERR_500.code })
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
        return res.json({ message: 'Success !', code: SUCCESS_200.code })
    } catch (error) {
        _logger.error("Xoá tùy chỉnh bảng bị lỗi: ", error)
        return res.json({ message: error.message, code: ERR_500.code })
    }
}

exports.saveCallRating = async (req, res) => {
    let transaction
    try {
        const { resultCriteria, note, type, dataEditOrigin } = req.body
        const { timeNoteMinutes, timeNoteSecond } = note || {}
        const { idScoreScript, callId } = resultCriteria && resultCriteria[0] ? resultCriteria[0] : {}
        transaction = await model.sequelize.transaction()
        if (resultCriteria && resultCriteria.length > 0) {
            //xóa các các kết quả trước đó của mục tiêu
            const findCallRating = await model.CallRating.findAll({ where: { callId: callId } })
            const ids = _.pluck(findCallRating, 'id')
            if (ids.length > 0) await model.CallRating.destroy({ where: { id: { [Op.in]: ids } } }, { transaction: transaction })
            await model.CallRating.bulkCreate(resultCriteria, { transaction: transaction })
        }

        if (note) {
            note.timeNoteMinutes = _.refactorTimeToMinutes(timeNoteMinutes, timeNoteSecond).newMinutes
            note.timeNoteSecond = _.refactorTimeToMinutes(timeNoteMinutes, timeNoteSecond).newSeconds
            const checkExistNote = await model.CallRatingNote.findOne({ where: { callId: note.callId, timeNoteMinutes: note.timeNoteMinutes, timeNoteSecond: note.timeNoteSecond } }, { transaction: transaction })
            if (checkExistNote) throw new Error(timeNoteExists)
            note.created = req.user.id
            note.idCriteriaGroup == 0 ? note.idCriteriaGroup = null : ''
            const getIdScoreScript = await model.CallRatingNote.findOne({ where: { callId: note.callId, idScoreScript: { [Op.ne]: null } } }, { transaction: transaction })
            note.idScoreScript = idScoreScript ? idScoreScript : (getIdScoreScript ? getIdScoreScript.idScoreScript : null)
            await model.CallRatingNote.create(note, { transaction: transaction })
            //đồng bộ kịch bản chấm điểm
            if (callId && idScoreScript) {
                const findCallRatingNote = await model.CallRatingNote.findAll({ where: { callId: callId, idScoreScript: { [Op.eq]: null } } }, { transaction: transaction })
                if (findCallRatingNote.length) {
                    for (const note of findCallRatingNote) {
                        note.update({ idScoreScript })
                        await note.save()
                    }
                }
            }
        }

        // create history
        switch (type) {
            case 'add':
                await model.CallRatingHistory.create({ type: CreatedByForm.ADD, created: req.user.id, callId: callId }, { transaction: transaction })
                break
            case 'edit':
                await createCallRatingHistory(dataEditOrigin, resultCriteria, req.user.id, CreatedByForm.EDIT, transaction)
                break
            default:
                break
        }

        await transaction.commit()
        return res.json({ code: SUCCESS_200.code, message: 'Success!' })
    } catch (error) {
        _logger.error("Tạo mới chấm điểm: ", error)
        return res.json({ code: ERR_500.code, message: error.message })
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

        const { origTime, duration, recordingFileName, caller, called } = el.callInfo

        el.callInfo.origTime = moment(origTime * 1000).format('HH:mm:ss DD/MM/YYYY')
        el.callInfo.duration = _.hms(duration)
        el.callInfo.recordingFileName = _config.pathRecording + recordingFileName

        // che số
        if (privatePhoneNumber) {
            if (caller && caller.length >= 10) el.callInfo.caller = cheSo(caller, 4)
            if (called && called.length >= 10) el.callInfo.called = cheSo(called, 4)
        }

        return el
    })

    return newData
}

async function createCallRatingHistory(dataEditOrigin, resultCriteria, userId, type, transaction) {
    let resultCompare = []
    resultCriteria.map(function (el1) {
        dataEditOrigin.map(function (el2) {
            if (Number(el1.idSelectionCriteria) !== Number(el2.idSelectionCriteria) && Number(el1.idCriteria) === Number(el2.idCriteria) && Number(el1.idScoreScript) === Number(el2.idScoreScript)) {
                el1.idSelectionCriteriaOld = el2.idSelectionCriteria
                el1.idSelectionCriteriaNew = el1.idSelectionCriteria
                resultCompare.push(el1)
            }
        })
    })
    const resultInsert = resultCompare.map(el => {
        el.created = userId
        el.type = type
        return el
    })
    await model.CallRatingHistory.bulkCreate(resultInsert, { transaction: transaction })
}

