const cron = require("node-cron")
const model = require('../models')
const { CONST_STATUS, CONST_COND } = require('../helpers/constants/constScoreTarget')
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

                for (let i = 0; i < findScoreTargetAssign.length; i++) {
                    try {
                        const scoreTargetAssign = findScoreTargetAssign[i]

                        const checkKPI = await model.CallShare.count({ where: { assignFor: scoreTargetAssign.userId, scoreTargetId: scoreTarget.id } })
                        if (checkKPI >= scoreTarget.numberOfCall) {
                            _logger.info('UserId ' + scoreTargetAssign.userId + ' success KPI for scoreTarget ' + scoreTarget.name + ' !')
                            continue
                        }
                        const queryCall = await buildQueryCall(scoreTarget.id)

                        _logger.info("Query implement", scoreTarget.name, queryCall)

                        const KPIRemaining = scoreTarget.numberOfCall - checkKPI

                        const dataShare = await model.CallDetailRecords.findAll({
                            where: {
                                [Op[queryCall.conditionSearch]]: queryCall.query,
                                share: false
                            },
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
    findConditions.map(el => {
        const { data, cond, value } = el
        let obj = {}
        if (cond) {
            obj[data] = { [Op[CONST_COND[cond].n]]: value }
            query.push(obj)
        } else {
            obj[data] = value
            query.push(obj)
        }
    })
    console.log("Query implement", query)
    return { conditionSearch: findConditions[0].conditionSearch, query: query }
}