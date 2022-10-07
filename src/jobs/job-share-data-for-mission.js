const cron = require("node-cron")
const model = require('../models')
const { CONST_STATUS } = require('../helpers/constants/constScoreTarget')
try {
    cron.schedule("*/1 * * * *", async () => {
        _logger.info('start job share data for mission at ' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss"))
        const findScoreTarget = await model.ScoreTarget.findAll({ where: { status: CONST_STATUS.ACTIVE.value } })
        if (!findScoreTarget.length) return _logger.info('Find not score target satisfy !')
        _logger.info('Find ' + findScoreTarget.length + ' score target satisfy !')
        for (let i = 0; i <= findScoreTarget.length; i++) {
            const scoreTarget = findScoreTarget[i]
            const currentTime = _moment(new Date()).format("HH:mm:ss")
            if (scoreTarget.assignStart > currentTime || scoreTarget.assignEnd < currentTime) {
                _logger.info('ScoreTarget ' + scoreTarget.name + ' unsatisfied time share call !')
                continue
            }
        }
    })
} catch (err) {
    _logger.error('job share data for mission at' + _moment(new Date()).format("DD/MM/YYYY HH:mm:ss") + "fail " + err)
}