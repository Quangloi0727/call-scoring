const cron = require("node-cron")
const model = require('../models')
const { STATUS, TypeDateSaveForCall } = require('../helpers/constants/index')
const { Op } = require('sequelize')

// job share call
cron.schedule("0 0 * * *", async () => {
    try {
        _logger.info('start job clear data policy at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss"))
        const findDataPolicy = await model.DataRetentionPolicy.findAll({ where: { status: STATUS.ACTIVE.value } })
        if (!findDataPolicy.length) return _logger.info('Find not data policy active !')
        _logger.info('Find ' + findDataPolicy.length + ' data policy active !')
        for (let i = 0; i < findDataPolicy.length; i++) {
            const {
                id,
                unlimitedSaveForCallGotPoint,
                unlimitedSaveForCallNoPoint,
                nameDataRetentionPolicy,
                typeDateSaveForCallGotPoint,
                valueSaveForCallGotPoint,
                valueSaveForCallNoPoint,
                typeDateSaveForCallNoPoint
            } = findDataPolicy[i]

            const findTeamApply = await model.DataRetentionPolicyTeam.findAll({ where: { dataRetentionPolicyId: id }, nest: true, raw: true })
            const idsTeam = _.pluck(findTeamApply, 'teamId')
            const findAgentByTeam = await model.AgentTeamMember.findAll({ where: { teamId: { [Op.in]: idsTeam } }, nest: true, raw: true })
            const idsUser = _.pluck(findAgentByTeam, 'userId')

            if (unlimitedSaveForCallGotPoint == true) {
                _logger.info(`Data policy ${nameDataRetentionPolicy} save scored call unlimited !`)
            } else {
                _logger.info(`Data policy ${nameDataRetentionPolicy} remove for ${valueSaveForCallGotPoint} ${typeDateSaveForCallGotPoint} !`)
                const dateQuery = buildQueryTime(valueSaveForCallGotPoint, typeDateSaveForCallGotPoint)
                await actionClearData(dateQuery, true, idsUser)
            }

            if (unlimitedSaveForCallNoPoint == true) {
                _logger.info(`Data policy ${nameDataRetentionPolicy} save call not scored unlimited !`)
            } else {
                _logger.info(`Data policy ${nameDataRetentionPolicy} remove for ${valueSaveForCallNoPoint} ${typeDateSaveForCallNoPoint} !`)
                const dateQuery = buildQueryTime(valueSaveForCallNoPoint, typeDateSaveForCallNoPoint)
                await actionClearData(dateQuery, false, idsUser)
            }
        }

    } catch (error) {
        _logger.error('start job clear data policy at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss") + "fail " + error)
    }
})


async function actionClearData(dateQuery, keyQuery, idsUser) {
    dateQuery = _moment(dateQuery).valueOf() / 1000
    let _query = {}
    if (keyQuery == true) {
        _query = { isMark: true, connectTime: { [Op.lte]: dateQuery } }
    } else {
        _query = { isMark: false, connectTime: { [Op.lte]: dateQuery } }
    }
    if (idsUser.length) {
        idsUser = _.removeElementDuplicate(idsUser)
        _query = { ..._query, assignFor: { [Op.in]: idsUser } }
    }
    console.log('query remove', _query)
    const findIdCall = await model.CallDetailRecords.findAll({ where: _query, attributes: ['id'], raw: true, nest: true })
    const callIdRemove = _.pluck(findIdCall, 'id')
    _logger.info("idCallRemove", callIdRemove)
    if (callIdRemove.length) {
        const dataRemove1 = await model.CallShare.destroy({ where: { callId: { [Op.in]: callIdRemove } } })
        const dataRemove2 = await model.CallDetailRecords.destroy({ where: { id: { [Op.in]: callIdRemove } } })
        _logger.info(`Removed1 ${dataRemove1} data ${keyQuery == true ? 'scored !' : 'not scored !'} `)
        _logger.info(`Removed2 ${dataRemove2} data ${keyQuery == true ? 'scored !' : 'not scored !'} `)
    } else {
        _logger.info(`Not find id call remove ! `)
    }

}

function buildQueryTime(valueSaveForCallGotPoint, typeDateSaveForCallGotPoint) {
    let dateQuery
    if (typeDateSaveForCallGotPoint == TypeDateSaveForCall.DAY.value) {
        const calculateDate = _moment().subtract(valueSaveForCallGotPoint, 'days')
        dateQuery = _moment(calculateDate).startOf('d').format('YYYY-MM-DD HH:mm:ss')
    }
    if (typeDateSaveForCallGotPoint == TypeDateSaveForCall.MONTH.value) {
        const calculateDate = _moment().subtract(valueSaveForCallGotPoint, 'month')
        dateQuery = _moment(calculateDate).startOf('d').format('YYYY-MM-DD HH:mm:ss')
    }
    if (typeDateSaveForCallGotPoint == TypeDateSaveForCall.YEAR.value) {
        const calculateDate = _moment().subtract(valueSaveForCallGotPoint, 'year')
        dateQuery = _moment(calculateDate).startOf('d').format('YYYY-MM-DD HH:mm:ss')
    }
    return dateQuery
}