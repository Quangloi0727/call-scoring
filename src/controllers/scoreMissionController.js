const { Op } = require('sequelize')
const pagination = require('pagination')
const titlePage = 'Danh sách nhiệm vụ chấm điểm'
const {
    SUCCESS_200,
    ERR_500,
} = require("../helpers/constants/statusCodeHTTP")

const {
    CONST_STATUS,
    USER_ROLE,
    TeamStatus,
    constTypeResultCallRating
} = require('../helpers/constants/index')

const { headerDefault, idCallNotFound, callHasBeenScored, timeNoteExists, CreatedByForm } = require('../helpers/constants/fieldScoreMission')

const { cheSo } = require("../helpers/functions")

const model = require('../models')

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
            CreatedByForm,
            constTypeResultCallRating
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

        const { roles, id } = req.user

        const arrUserId = await checkRoleUser(roles, id)

        let queryAssignFor = {}

        if (!arrUserId.length) {
            queryAssignFor = {}
        } else {
            queryAssignFor = { assignFor: arrUserId }
        }

        let findList = model.CallShare.findAll({
            where: queryAssignFor,
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

        let count = model.CallShare.count({ where: queryAssignFor })

        const [listData, totalRecord] = await Promise.all([findList, count])

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

            const idSelectionCriterias = _.pluck(resultCriteria, 'idSelectionCriteria')

            await Promise.all([
                updateCallShare(req, idSelectionCriterias, idScoreScript, callId, transaction),
                model.CallRating.bulkCreate(resultCriteria, { transaction: transaction })
            ])
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

        el.callInfo.origTime = _moment(origTime * 1000).format('HH:mm:ss DD/MM/YYYY')
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

async function checkRoleUser(roles, id) {
    let arrUserId = []
    const findRoleAdmin = roles.filter(el => el.role == USER_ROLE.admin.n)
    if (findRoleAdmin.length) return arrUserId
    arrUserId = arrUserId.concat(id)
    for (let i = 0; i < roles.length; i++) {
        // check role quản lý đội ngũ
        if (roles[i].role == USER_ROLE.supervisor.n) {
            const teams = await model.AgentTeamMember.findAll({
                where: { userId: id, role: USER_ROLE.supervisor.n },
                include: [{
                    model: model.Team,
                    as: 'teams',
                    where: {
                        status: { [Op.eq]: TeamStatus.ON }
                    }
                }],
                raw: true,
                nest: true
            })
            const teamId = _.pluck(teams, 'teamId')
            const findUserIdInTeams = await model.AgentTeamMember.findAll({
                where: { teamId: { [Op.in]: teamId }, role: USER_ROLE.agent.n },
                raw: true,
                nest: true
            })
            arrUserId = arrUserId.concat(_.pluck(findUserIdInTeams, 'userId'))
        }
        // check role quản lý nhóm
        if (roles[i].role == USER_ROLE.groupmanager.n) {
            const groups = await model.UserGroupMember.findAll({
                where: { userId: id, role: USER_ROLE.groupmanager.n },
                raw: true,
                nest: true
            })
            const groupId = _.pluck(groups, 'groupId')
            const findTeamByGroup = await model.TeamGroup.findAll({
                where: { groupId: { [Op.in]: groupId } },
                include: [{
                    model: model.Team,
                    as: 'Team',
                    where: {
                        status: { [Op.eq]: TeamStatus.ON }
                    }
                }],
                raw: true,
                nest: true
            })
            const teamId = _.pluck(findTeamByGroup, 'teamId')
            const findUserIdInTeams = await model.AgentTeamMember.findAll({
                where: { teamId: { [Op.in]: teamId }, role: USER_ROLE.agent.n },
                raw: true,
                nest: true
            })
            arrUserId = arrUserId.concat(_.pluck(findUserIdInTeams, 'userId'))
        }
        continue
    }
    return arrUserId
}
/**
 * update vào bảng callShare dữ liệu chấm điểm của cuộc gọi
 * @param {Array} idSelectionCriterias mảng id của SelectionCriteria
 * @param {String} idScoreScript id kịch bản
 * @param {String} callId mã cuộc gọi
 * 
 */
async function updateCallShare(req, idSelectionCriterias, idScoreScript, callId, transaction) {
    let [point, scoreScript] = await Promise.all([
        model.SelectionCriteria.sum('score', { where: { id: { [Op.in]: idSelectionCriterias } } }),
        model.ScoreScript.findOne({ where: { id: idScoreScript } })
    ])

    // tìm kiếm điểm liệt của nhóm tiêu chí
    const unScoreCriteriaGroup = await model.SelectionCriteria.findAll({
        where: {
            id: { [Op.in]: idSelectionCriterias },
            unScoreCriteriaGroup: false
        }
    })

    // nếu tồn tại thì loại bỏ toàn bỏ điểm của nhóm tiêu chí đó
    if (unScoreCriteriaGroup.length > 0) {

        const criteriaGroupIds = await model.Criteria.findAll({
            where: { id: { [Op.in]: _.pluck(unScoreCriteriaGroup, 'criteriaId') } },
            attributes: ['criteriaGroupId'],
            raw: true
        })

        const criterias = await model.Criteria.findAll({
            where: { criteriaGroupId: { [Op.in]: _.pluck(criteriaGroupIds, 'criteriaGroupId') } },
            raw: true
        })

        // lấy ra ds các id thuộc nhóm tiêu chí đã bị chọn liệt`
        point = await model.SelectionCriteria.sum('score', {
            where: {
                id: { [Op.in]: idSelectionCriterias },
                criteriaId: { [Op.notIn]: _.pluck(criterias, 'id') }
            }
        })
    }

    // tìm kiếm điểm liệt của Kich bản
    const unScoreScript = await model.SelectionCriteria.findAll({
        where: {
            id: { [Op.in]: idSelectionCriterias },
            unScoreScript: false
        }
    })

    if (unScoreScript.length) point = 0

    const updateCallShare = {
        pointResultCallRating: point,
        typeResultCallRating: renderTypeResultCallRating(scoreScript, point),
        idScoreScript: idScoreScript,
        idUserReview: req.user.id,
    }

    // create history
    switch (req.body.type) {
        case 'add':
            updateCallShare.reviewedAt = _moment(new Date())
            updateCallShare.isMark = true
            updateCallShare.updateReviewedAt = _moment(new Date())
            break
        case 'edit':
            updateCallShare.updateReviewedAt = _moment(new Date())
            break
        default:
            break
    }
    return await model.CallShare.update(updateCallShare, { where: { callId: callId } }, { transaction: transaction })
}


function renderTypeResultCallRating(scoreScript, point) {
    let typeResultCallRating = ''
    switch (true) {
        case scoreScript.needImproveMin <= point && scoreScript.needImproveMax >= point:
            typeResultCallRating = constTypeResultCallRating.pointNeedImprove.code
            break
        case scoreScript.standardMin <= point && scoreScript.standardMax >= point:
            typeResultCallRating = constTypeResultCallRating.pointStandard.code
            break
        case scoreScript.passStandardMin <= point:
            typeResultCallRating = constTypeResultCallRating.pointPassStandard.code
            break
    }
    return typeResultCallRating
}

