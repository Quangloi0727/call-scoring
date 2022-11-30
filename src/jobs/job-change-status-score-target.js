const cron = require("node-cron")
const model = require('../models')
const { CONST_STATUS, CONST_EFFECTIVE_TIME_TYPE } = require('../helpers/constants/constScoreTarget')
const { Op } = require('sequelize')

// job enable status score target ('0 0 * * *')
cron.schedule("0 0 * * *", async () => {
    try {
        _logger.info('start job enable status score target at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss"))
        const queryDate = _moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        _logger.info("queryDate job enable status", queryDate)
        const findScoreTarget = await model.ScoreTarget.findAll({
            where: { status: CONST_STATUS.DRAFT.value, effectiveTimeType: CONST_EFFECTIVE_TIME_TYPE.ABOUT_DAY.value, effectiveTimeStart: { [Op.gte]: queryDate } },
            raw: true
        })
        if (!findScoreTarget.length) return _logger.info("Find not score target to update status active")

        const arrayIdUpdate = _.pluck(findScoreTarget, 'id')
        await model.ScoreTarget.update({ status: CONST_STATUS.ACTIVE.value }, { where: { id: { [Op.in]: arrayIdUpdate } } })

        _logger.info("Update success id " + arrayIdUpdate + " to status active")
    } catch (error) {
        _logger.error('job enable status score target at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss") + "fail " + error)
    }
})

// job disable status score target ('0 0 * * *')
cron.schedule("0 0 * * *", async () => {
    try {
        _logger.info('start job disable status score target at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss"))
        const queryDate = _moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        _logger.info("queryDate job disable status", queryDate)
        const findScoreTarget = await model.ScoreTarget.findAll({
            where: { status: CONST_STATUS.ACTIVE.value, effectiveTimeType: CONST_EFFECTIVE_TIME_TYPE.ABOUT_DAY.value, effectiveTimeEnd: { [Op.lte]: queryDate } },
            raw: true
        })
        if (!findScoreTarget.length) return _logger.info("Find not score target to update status disable")

        const arrayIdUpdate = _.pluck(findScoreTarget, 'id')
        await model.ScoreTarget.update({ status: CONST_STATUS.UN_ACTIVE.value }, { where: { id: { [Op.in]: arrayIdUpdate } } })

        _logger.info("Update success id " + arrayIdUpdate + " to status disable")
    } catch (error) {
        _logger.error('job disable status score target at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss") + "fail " + error)
    }
})
