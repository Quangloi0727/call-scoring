const cron = require("node-cron")
const model = require('../models')
const { CONST_STATUS, CONST_COND, CONST_EFFECTIVE_TIME_TYPE, CONST_RATING_BY } = require('../helpers/constants/constScoreTarget')
const { TeamStatus } = require('../helpers/constants/index')
const { Op } = require('sequelize')

// job share call
cron.schedule("*/5 * * * *", async () => {
    try {
        _logger.info('start job share data for mission at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss"))
        const findScoreTarget = await model.ScoreTarget.findAll({ where: { status: CONST_STATUS.ACTIVE.value } })
        if (!findScoreTarget.length) return _logger.info('Find not score target satisfy !')
        _logger.info('Find ' + findScoreTarget.length + ' score target satisfy !')
        for (let i = 0; i < findScoreTarget.length; i++) {
            try {
                const scoreTarget = findScoreTarget[i]
                const currentTime = _moment(new Date()).format("HH:mm:ss")

                if (scoreTarget.assignStart > currentTime || scoreTarget.assignEnd < currentTime) {
                    _logger.info('ScoreTarget ' + scoreTarget.name + ' unsatisfied time share call !')
                    continue
                }

                const findScoreTargetAssign = await model.ScoreTargetAssignment.findAll({ where: { scoreTargetId: scoreTarget.id }, raw: true })

                if (!findScoreTargetAssign.length) {
                    _logger.info('ScoreTarget ' + scoreTarget.name + ' not have user assigned !')
                    continue
                }

                const queryCountImplement = buildQueryCount(scoreTarget.effectiveTimeType)

                switch (scoreTarget.ratingBy) {
                    case CONST_RATING_BY.all.n:
                        await shareCallAllSystem(scoreTarget, findScoreTargetAssign, queryCountImplement)
                        break

                    case CONST_RATING_BY.agent.n:
                        await shareCallEachAgent(scoreTarget, findScoreTargetAssign, queryCountImplement)
                        break

                    case CONST_RATING_BY.supervisor.n:
                        await shareCallEachSupervisor(scoreTarget, findScoreTargetAssign, queryCountImplement)
                        break

                    default:
                        _logger.info('ScoreTarget ' + scoreTarget.name + ' not have rating by object !')
                        break
                }
            } catch (error) {
                throw error
            }
        }
    } catch (error) {
        _logger.error('job share data for mission at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss") + "fail " + error)
    }
})

async function shareCallAllSystem(scoreTarget, findScoreTargetAssign, queryCountImplement) {
    const { callStartTime, callEndTime, numberOfCall, name, id } = scoreTarget

    const queryCall = await buildQueryCall(id)
    console.log("Query implement", scoreTarget.name, queryCall)

    let _queryCallSatisfy = mapStartTimeEndTime(queryCall, callStartTime, callEndTime)
    console.log("Query implement final", scoreTarget.name, _queryCallSatisfy)

    // số cuộc gọi mỗi nhân sự phải chấm theo cấu hình
    const KPIOrigin = calculateKPI(findScoreTargetAssign, Number(numberOfCall))

    // số cuộc gọi thực tế đáp ứng
    const countCallReality = await model.CallDetailRecords.count({ where: _queryCallSatisfy })

    if (countCallReality == 0) return _logger.info("Not find call satisfy to share !")

    const KPIReality = calculateKPI(findScoreTargetAssign, Number(countCallReality))

    const findCallShared = await model.CallShare.count({ where: { scoreTargetId: id } })

    if (findCallShared >= numberOfCall) return _logger.info(`ScoreTarget ${name} complete share call !`)

    for (let i = 0; i < KPIOrigin.length; i++) {
        try {
            const checkKPI = await model.CallShare.count({
                where: {
                    [Op.and]: [
                        { assignFor: KPIOrigin[i].userId, scoreTargetId: id },
                        queryCountImplement
                    ]
                }
            })

            if (checkKPI >= KPIOrigin[i].countKPI) {
                _logger.info('UserId ' + KPIOrigin[i].userId + ' success KPI for scoreTarget ' + name + ' !')
                continue
            }


            if (KPIOrigin[i].countKPI <= KPIReality[i].countKPI) {
                _logger.info(`Satisfy call ${KPIReality[i].countKPI} > KPI call ${KPIOrigin[i].countKPI}`)
                const KPIRemaining1 = checkKPI == 0 ? Number(KPIOrigin[i].countKPI) : (Number(KPIOrigin[i].countKPI) - checkKPI)
                await actionShareCall(id, KPIOrigin[i].userId, KPIRemaining1, _queryCallSatisfy)
            } else {
                _logger.info('Satisfy call < KPI call')
                if (checkKPI + KPIReality[i].countKPI <= KPIOrigin[i].countKPI) {
                    _logger.info(`Satisfy call find ${KPIReality[i].countKPI} + callShare ${checkKPI} < KPI origin ${KPIOrigin[i].countKPI}`)
                    const KPIRemaining2 = checkKPI == 0 ? Number(KPIReality[i].countKPI) : (Number(KPIOrigin[i].countKPI) - checkKPI)
                    await actionShareCall(id, KPIReality[i].userId, KPIRemaining2, _queryCallSatisfy)
                } else {
                    _logger.info(`Satisfy call find ${KPIReality[i].countKPI} + callShare ${checkKPI}  > KPI origin ${KPIOrigin[i].countKPI}`)
                    const KPIRemaining3 = KPIOrigin[i].countKPI - checkKPI
                    _logger.info(`KPIRemaining ${KPIRemaining}`)
                    await actionShareCall(id, KPIReality[i].userId, KPIRemaining3, _queryCallSatisfy)
                }
            }

        } catch (error) {
            throw error
        }
    }
}

async function shareCallEachAgent(scoreTarget, findScoreTargetAssign, queryCountImplement) {
    const { callStartTime, callEndTime, numberOfCall, name, id } = scoreTarget

    const queryCall = await buildQueryCall(id)
    console.log("Query implement", scoreTarget.name, queryCall)

    let _queryCallSatisfy = mapStartTimeEndTime(queryCall, callStartTime, callEndTime)

    console.log("Query implement final", scoreTarget.name, _queryCallSatisfy)

    // lấy số agent đang hoạt động
    const users = await model.User.findAll({ where: { isActive: 1 }, raw: true })

    const idsUser = _.pluck(users, 'id')

    _logger.info("Ids user share", idsUser)

    if (!idsUser.length) return _logger.info("Not found user satisfy")

    for (let u = 0; u < idsUser.length; u++) {
        // số cuộc gọi mỗi nhân sự phải chấm theo cấu hình
        const KPIOrigin = calculateKPI(findScoreTargetAssign, Number(numberOfCall))

        // số cuộc gọi thực tế đáp ứng
        _queryCallSatisfy = { ..._queryCallSatisfy, agentId: idsUser[u] }

        const countCallReality = await model.CallDetailRecords.count({ where: _queryCallSatisfy })

        if (countCallReality == 0) {
            _logger.info("Not find call satisfy for userId " + idsUser[u] + " to share !")
            continue
        }

        const KPIReality = calculateKPI(findScoreTargetAssign, Number(countCallReality))

        for (let i = 0; i < KPIOrigin.length; i++) {
            try {
                const checkKPI = await model.CallShare.count({
                    where: {
                        [Op.and]: [
                            { assignFor: KPIOrigin[i].userId, scoreTargetId: id, agentIdOfCall: idsUser[u] },
                            queryCountImplement
                        ]
                    }
                })

                if (checkKPI >= KPIOrigin[i].countKPI) {
                    _logger.info('UserId ' + KPIOrigin[i].userId + ' success KPI for scoreTarget ' + name + ' !')
                    continue
                }


                if (KPIOrigin[i].countKPI <= KPIReality[i].countKPI) {
                    _logger.info(`Satisfy call ${KPIReality[i].countKPI} > KPI call ${KPIOrigin[i].countKPI}`)
                    const KPIRemaining1 = checkKPI == 0 ? Number(KPIOrigin[i].countKPI) : (Number(KPIOrigin[i].countKPI) - checkKPI)
                    await actionShareCall(id, KPIOrigin[i].userId, KPIRemaining1, _queryCallSatisfy)
                } else {
                    _logger.info('Satisfy call < KPI call')
                    if (checkKPI + KPIReality[i].countKPI <= KPIOrigin[i].countKPI) {
                        _logger.info(`Satisfy call find ${KPIReality[i].countKPI} + callShare ${checkKPI} < KPI origin ${KPIOrigin[i].countKPI}`)
                        const KPIRemaining2 = checkKPI == 0 ? Number(KPIReality[i].countKPI) : (Number(KPIOrigin[i].countKPI) - checkKPI)
                        await actionShareCall(id, KPIReality[i].userId, KPIRemaining2, _queryCallSatisfy)
                    } else {
                        _logger.info(`Satisfy call find ${KPIReality[i].countKPI} + callShare ${checkKPI}  > KPI origin ${KPIOrigin[i].countKPI}`)
                        const KPIRemaining3 = KPIOrigin[i].countKPI - checkKPI
                        _logger.info(`KPIRemaining ${KPIRemaining}`)
                        await actionShareCall(id, KPIReality[i].userId, KPIRemaining3, _queryCallSatisfy)
                    }
                }

            } catch (error) {
                throw error
            }
        }
    }
}

async function shareCallEachSupervisor(scoreTarget, findScoreTargetAssign, queryCountImplement) {
    const { callStartTime, callEndTime, numberOfCall, name, id } = scoreTarget

    const queryCall = await buildQueryCall(id)
    console.log("Query implement", scoreTarget.name, queryCall)

    let _queryCallSatisfy = mapStartTimeEndTime(queryCall, callStartTime, callEndTime)
    console.log("Query implement final", scoreTarget.name, _queryCallSatisfy)

    // lấy số đội ngũ đang hoạt động
    const teams = await model.Team.findAll({ where: { status: TeamStatus.ON }, raw: true })

    const idsTeam = _.pluck(teams, 'id')

    _logger.info("Ids team share", idsTeam)

    if (!idsTeam.length) return _logger.info("Not found team satisfy")

    for (let t = 0; t < idsTeam.length; t++) {
        _logger.info("Start share for team", idsTeam[t])
        // số cuộc gọi mỗi nhân sự phải chấm theo cấu hình
        const KPIOrigin = calculateKPI(findScoreTargetAssign, Number(numberOfCall))

        // số cuộc gọi thực tế đáp ứng
        _queryCallSatisfy = { ..._queryCallSatisfy, teamId: idsTeam[t] }

        const countCallReality = await model.CallDetailRecords.count({ where: _queryCallSatisfy })

        if (countCallReality == 0) {
            _logger.info("Not find call satisfy for teamId " + idsTeam[t] + " to share !")
            continue
        }

        const KPIReality = calculateKPI(findScoreTargetAssign, Number(countCallReality))

        for (let i = 0; i < KPIOrigin.length; i++) {
            try {
                const checkKPI = await model.CallShare.count({
                    where: {
                        [Op.and]: [
                            { assignFor: KPIOrigin[i].userId, scoreTargetId: id, teamIdOfCall: idsTeam[t] },
                            queryCountImplement
                        ]
                    }
                })

                if (checkKPI >= KPIOrigin[i].countKPI) {
                    _logger.info('UserId ' + KPIOrigin[i].userId + ' success KPI for scoreTarget ' + name + ' !')
                    continue
                }


                if (KPIOrigin[i].countKPI <= KPIReality[i].countKPI) {
                    _logger.info(`Satisfy call ${KPIReality[i].countKPI} > KPI call ${KPIOrigin[i].countKPI}`)
                    const KPIRemaining1 = checkKPI == 0 ? Number(KPIOrigin[i].countKPI) : (Number(KPIOrigin[i].countKPI) - checkKPI)
                    await actionShareCall(id, KPIOrigin[i].userId, KPIRemaining1, _queryCallSatisfy)
                } else {
                    _logger.info('Satisfy call < KPI call')
                    if (checkKPI + KPIReality[i].countKPI <= KPIOrigin[i].countKPI) {
                        _logger.info(`Satisfy call find ${KPIReality[i].countKPI} + callShare ${checkKPI} < KPI origin ${KPIOrigin[i].countKPI}`)
                        const KPIRemaining2 = checkKPI == 0 ? Number(KPIReality[i].countKPI) : (Number(KPIOrigin[i].countKPI) - checkKPI)
                        await actionShareCall(id, KPIReality[i].userId, KPIRemaining2, _queryCallSatisfy)
                    } else {
                        _logger.info(`Satisfy call find ${KPIReality[i].countKPI} + callShare ${checkKPI}  > KPI origin ${KPIOrigin[i].countKPI}`)
                        const KPIRemaining3 = KPIOrigin[i].countKPI - checkKPI
                        _logger.info(`KPIRemaining ${KPIRemaining}`)
                        await actionShareCall(id, KPIReality[i].userId, KPIRemaining3, _queryCallSatisfy)
                    }
                }

            } catch (error) {
                throw error
            }
        }
    }
}

async function actionShareCall(scoreTargetId, userIdAssign, countKPI, _queryCallSatisfy) {

    const dataShare = await model.CallDetailRecords.findAll({
        //phân công cuộc gọi thỏa mãn điều kiện và không phân công cuộc gọi của chính agent đó
        where: { [Op.and]: [_queryCallSatisfy, { [Op.or]: [{ agentId: { [Op.ne]: userIdAssign } }, { agentId: { [Op.eq]: null } }] }] },
        order: [
            ['lastUpdateTime', 'ASC']
        ],
        attributes: ['id', 'teamId', 'agentId'],
        raw: true,
        limit: countKPI
    })
    if (!dataShare || !dataShare.length) return _logger.info("Not found call satisfy query")

    const dataInsertCallShare = dataShare.map(el => {
        el.callId = el.id
        el.assignFor = userIdAssign
        el.scoreTargetId = scoreTargetId
        el.agentIdOfCall = el.agentId
        el.teamIdOfCall = el.teamId
        delete el.id
        delete el.agentId
        delete el.teamId
        return el
    })
    await model.CallShare.bulkCreate(dataInsertCallShare)
    const arrayId = _.pluck(dataInsertCallShare, 'callId')
    await model.CallDetailRecords.update({ share: true }, { where: { id: { [Op.in]: arrayId } } })
}

async function buildQueryCall(scoreTargetId) {
    let query = []
    const findConditions = await model.ScoreTargetCond.findAll({ where: { scoreTargetId: scoreTargetId }, raw: true })
    if (!findConditions.length) return query
    await Promise.all(
        findConditions.map(async el => {
            const { data, cond, value } = el
            let obj = {}
            if (cond) {
                obj[data] = { [Op[CONST_COND[cond].n]]: value }
                query.push(obj)
            } else {
                if (data == "groupId") {
                    const findTeamByGroupId = await model.TeamGroup.findAll({ where: { groupId: value }, raw: true })
                    const teamId = _.pluck(findTeamByGroupId, "teamId")
                    query.push({ teamId: { [Op.in]: teamId } })
                } else {
                    obj[data] = value
                    query.push(obj)
                }
                return query
            }
            return query
        })
    )

    console.log("Query implement_2", query)
    return { conditionSearch: findConditions[0].conditionSearch, query: query }
}

function buildQueryCount(effectiveTimeType) {
    let query = {}
    switch (effectiveTimeType) {

        case CONST_EFFECTIVE_TIME_TYPE.EVERY_DAY.value:
            const startDate = _moment(new Date(), "YYYY-MM-DD HH:mm:ss").startOf('day').format('YYYY-MM-DD HH:mm:ss')
            const endDate = _moment(new Date(), "YYYY-MM-DD HH:mm:ss").endOf('day').format('YYYY-MM-DD HH:mm:ss')
            query.createdAt = {}
            query.createdAt[Op.gte] = startDate
            query.createdAt[Op.lte] = endDate
            break
        case CONST_EFFECTIVE_TIME_TYPE.EVERY_WEEK.value:
            const startWeek = _moment(new Date(), "YYYY-MM-DD HH:mm:ss").startOf('week').format('YYYY-MM-DD HH:mm:ss')
            const endDWeek = _moment(new Date(), "YYYY-MM-DD HH:mm:ss").endOf('week').format('YYYY-MM-DD HH:mm:ss')
            query.createdAt = {}
            query.createdAt[Op.gte] = startWeek
            query.createdAt[Op.lte] = endDWeek
            break
        case CONST_EFFECTIVE_TIME_TYPE.EVERY_MONTH.value:
            const startMonth = _moment(new Date(), "YYYY-MM-DD HH:mm:ss").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            const endDMonth = _moment(new Date(), "YYYY-MM-DD HH:mm:ss").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            query.createdAt = {}
            query.createdAt[Op.gte] = startMonth
            query.createdAt[Op.lte] = endDMonth
            break

        default:
            break
    }
    console.log("buildQueryCount", query)
    return query
}

function calculateKPI(findScoreTargetAssign, totalCall) {
    const KPI = parseInt(totalCall / findScoreTargetAssign.length)

    const scoreTargetAddKPI = findScoreTargetAssign.map(el => ({ ...el, countKPI: KPI }))

    const redundantData = totalCall - (KPI * findScoreTargetAssign.length)

    for (let i = 0; i < redundantData; i++) {
        scoreTargetAddKPI[i].countKPI = scoreTargetAddKPI[i].countKPI + 1
    }
    return scoreTargetAddKPI
}

function mapStartTimeEndTime(queryCall, callStartTime, callEndTime) {
    let _queryCallSatisfy = {}
    if (Array.isArray(queryCall)) {
        _queryCallSatisfy = { share: false }
    } else {
        _queryCallSatisfy = { [Op[queryCall.conditionSearch]]: queryCall.query, share: false }
    }

    if (callStartTime && callEndTime) {
        const callStartTimeFormat = _moment(callStartTime).format("DD/MM/YYYY")
        const callEndTimeFormat = _moment(callEndTime).format("DD/MM/YYYY")
        const callStartTimeQuery = _moment(callStartTimeFormat, "DD/MM/YYYY").startOf("d").valueOf()
        const callEndTimeQuery = _moment(callEndTimeFormat, "DD/MM/YYYY").endOf("d").valueOf()
        _queryCallSatisfy = { ..._queryCallSatisfy, origTime: { [Op.and]: [{ [Op.gte]: (callStartTimeQuery / 1000) }, { [Op.lte]: (callEndTimeQuery / 1000) }] } }
    }
    return _queryCallSatisfy
}
