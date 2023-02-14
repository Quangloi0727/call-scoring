const cron = require("node-cron")
const model = require('../models')
const { STATUS, TypeDateSaveForCall } = require('../helpers/constants/index')
const { Op } = require('sequelize')

// job share call
cron.schedule("*/1 * * * *", async () => {
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
            _logger.info(`List team apply remove ${idsTeam}`)

            if (unlimitedSaveForCallGotPoint == true) {
                _logger.info(`Data policy ${nameDataRetentionPolicy} save scored call unlimited !`)
            } else {
                _logger.info(`Data policy ${nameDataRetentionPolicy} remove for ${valueSaveForCallGotPoint} ${typeDateSaveForCallGotPoint} !`)
                const dateQuery = buildQueryTime(valueSaveForCallGotPoint, typeDateSaveForCallGotPoint)
                await actionClearData(dateQuery, true, idsTeam)
            }

            if (unlimitedSaveForCallNoPoint == true) {
                _logger.info(`Data policy ${nameDataRetentionPolicy} save call not scored unlimited !`)
            } else {
                _logger.info(`Data policy ${nameDataRetentionPolicy} remove for ${valueSaveForCallNoPoint} ${typeDateSaveForCallNoPoint} !`)
                const dateQuery = buildQueryTime(valueSaveForCallNoPoint, typeDateSaveForCallNoPoint)
                await actionClearData(dateQuery, false, idsTeam)
            }
        }

    } catch (error) {
        _logger.error('start job clear data policy at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss") + "fail " + error)
    }
})


async function actionClearData(dateQuery, keyQuery, idsTeam) {
    dateQuery = _moment(dateQuery).valueOf() / 1000
    let _queryCallDetailRecord = {}
    let _queryCallShare = {}
    if (keyQuery == true) {
        _queryCallDetailRecord = { isMark: true, origTime: { [Op.lte]: dateQuery } }
        _queryCallShare = { isMark: true, origTimeOfCall: { [Op.lte]: dateQuery } }
    } else {
        _queryCallDetailRecord = { isMark: false, origTime: { [Op.lte]: dateQuery } }
        _queryCallShare = { isMark: false, origTimeOfCall: { [Op.lte]: dateQuery } }
    }
    if (idsTeam.length) {
        idsTeam = _.removeElementDuplicate(idsTeam)
        _queryCallDetailRecord = { ..._queryCallDetailRecord, teamId: { [Op.in]: idsTeam } }
        _queryCallShare = { ..._queryCallShare, teamIdOfCall: { [Op.in]: idsTeam } }
    }
    console.log('query remove CallDetailRecord', _queryCallDetailRecord)
    _logger.info('query remove CallDetailRecord', _queryCallDetailRecord)
    console.log('query remove CallShare', _queryCallShare)
    _logger.info('query remove CallShare', _queryCallShare)

    const dataRemoveCallShare = await model.CallShare.destroy({ where: _queryCallShare })

    const findIdCall = await model.CallDetailRecords.findAll({ where: _queryCallDetailRecord, attributes: ['id'], raw: true, nest: true })
    const callIdRemove = _.pluck(findIdCall, 'id')
    _logger.info("idCallRemove", callIdRemove)
    if (callIdRemove.length) {
        await model.CallRating.destroy({ where: { callId: { [Op.in]: callIdRemove } } })
        await model.CallRatingHistory.destroy({ where: { callId: { [Op.in]: callIdRemove } } })
        const dataRemoveCallDetailRecord = await model.CallDetailRecords.destroy({ where: _queryCallDetailRecord })
        _logger.info(`dataRemoveCallDetailRecord ${dataRemoveCallDetailRecord} data ${keyQuery == true ? 'scored !' : 'not scored !'} `)
    } else {
        _logger.info(`Not find id call remove ! `)
    }

    _logger.info(`dataRemoveCallShare ${dataRemoveCallShare} data ${keyQuery == true ? 'scored !' : 'not scored !'} `)
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