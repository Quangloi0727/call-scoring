const cron = require("node-cron")
const model = require('../models')
const { CONST_STATUS, CONST_COND, CONST_EFFECTIVE_TIME_TYPE } = require('../helpers/constants/constScoreTarget')
const { Op } = require('sequelize')

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

                for (let i = 0; i < findScoreTargetAssign.length; i++) {
                    try {
                        const scoreTargetAssign = findScoreTargetAssign[i]

                        const checkKPI = await model.CallShare.count({
                            where: {
                                [Op.and]: [
                                    { assignFor: scoreTargetAssign.userId, scoreTargetId: scoreTarget.id },
                                    queryCountImplement
                                ]
                            }
                        })

                        if (checkKPI >= scoreTarget.numberOfCall) {
                            _logger.info('UserId ' + scoreTargetAssign.userId + ' success KPI for scoreTarget ' + scoreTarget.name + ' !')
                            continue
                        }
                        const queryCall = await buildQueryCall(scoreTarget.id)

                        _logger.info("Query implement", scoreTarget.name, queryCall)

                        const KPIRemaining = scoreTarget.numberOfCall - checkKPI

                        let _queryCallSatisfy = {}

                        if (!queryCall.length) {
                            _queryCallSatisfy = { share: false }
                        } else {
                            _queryCallSatisfy = { [Op[queryCall.conditionSearch]]: queryCall.query, share: false }
                        }

                        const dataShare = await model.CallDetailRecords.findAll({
                            where: _queryCallSatisfy,
                            order: [
                                ['lastUpdateTime', 'ASC']
                            ],
                            attributes: ['id'],
                            raw: true,
                            limit: KPIRemaining
                        })

                        if (!dataShare || !dataShare.length) {
                            _logger.info("Not found call satisfy query")
                            continue
                        }

                        const dataInsertCallShare = dataShare.map(el => {
                            el.callId = el.id
                            el.assignFor = scoreTargetAssign.userId
                            el.scoreTargetId = scoreTarget.id
                            delete el.id
                            return el
                        })
                        await model.CallShare.bulkCreate(dataInsertCallShare)
                        const arrayId = _.pluck(dataInsertCallShare, 'callId')
                        await model.CallDetailRecords.update({ share: true }, { where: { id: { [Op.in]: arrayId } } })
                        return
                    } catch (error) {
                        throw error
                    }
                }
            } catch (error) {
                throw error
            }
        }
    } catch (error) {
        _logger.error('job share data for mission at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss") + "fail " + error)
    }
})


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

    console.log("Query implement", query)
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