const { SYSTEM_RULE } = require('../helpers/constants/index')
const model = require('../models')
const { Op } = require('sequelize')
module.exports = {
    mapHeaderDefault: function (headerDefault, additionalField) {
        let newObject = additionalField.reduce(
            (obj, item) => Object.assign(obj, { [item.code]: item.value }), {})
        return { ...headerDefault, ...newObject }
    },
    hms: function (secs) {
        if (isNaN(secs) || !secs || secs == 0) return '00:00:00'

        let sec = 0
        let minutes = 0
        let hours = 0

        sec = Math.ceil(secs)
        minutes = Math.floor(sec / 60)
        sec = sec % 60
        hours = Math.floor(minutes / 60)
        minutes = minutes % 60

        return `${hours}:${_.pad(minutes)}:${_.pad(sec)}`
    },

    pad: function (num) {
        return ('0' + num).slice(-2)
    },

    /**
     * Computed the boundaries limits and return them
     * @param minutes phút nhập vào
     * @param seconds giây nhập vào
     */
    refactorTimeToMinutes: function (minutes, seconds) {
        let _minutes = minutes ? parseInt(minutes) : 0
        let _seconds = seconds ? parseInt(seconds) : 0

        var newMinutes = Math.floor(_seconds / 60) + _minutes
        var newSeconds = _seconds - newMinutes * 60

        return { newMinutes: newMinutes, newSeconds: newSeconds }
    },
    removeElementDuplicate: function (arr) {
        let s = new Set(arr)
        let it = s.values()
        return Array.from(it)
    },
    removeValueEmptyOfKey: function (arr, key) {
        const result = arr.filter(el => el[key] != '' || el[key] == null || el[key] == undefined)
        return result
    },
    convertPercentNumber(number1, number2) {
        if (number1 == 0 && number2 == 0) return 0
        return ((number1 / number2) * 100).toFixed(0)
    },
    async getListEvaluator() {
        const findRuleScoreScript = await model.Rule.findOne({ where: { code: { [Op.eq]: SYSTEM_RULE.CHAM_DIEM_CUOC_GOI.code } } })
        if (!findRuleScoreScript) return []

        const findRuleDetailScoreScript = await model.RuleDetail.findAll({ where: { [Op.and]: [{ ruleId: { [Op.eq]: findRuleScoreScript.id } }, { unLimited: { [Op.eq]: true } }] }, raw: true })
        if (!findRuleDetailScoreScript.length) return []

        const roleScoreScriptIds = _.pluck(findRuleDetailScoreScript, 'role')
        const userRole = await model.UserRole.findAll({ where: { role: { [Op.in]: roleScoreScriptIds } }, raw: true })
        if (!userRole.length) return []
        const idsUserReview = _.pluck(userRole, 'userId')
        _logger.info('List idUser assign', _.removeElementDuplicate(idsUserReview))

        return model.User.findAll({
            where: { id: { [Op.in]: _.removeElementDuplicate(idsUserReview) } },
            attributes: ['id', 'fullName', 'userName']
        })
    }
}