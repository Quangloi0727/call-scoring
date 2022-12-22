const { Op } = require('sequelize')
const model = require('../models')

const { USER_ROLE, SYSTEM_RULE } = require('../helpers/constants')

exports.checkRoleCommentCall = async (req) => {
    let { user } = req
    if (user && user.roles.find(i => i.role == USER_ROLE.admin.n)) return true
    const findRuleCommentCall = await model.Rule.findOne({ where: { code: { [Op.eq]: SYSTEM_RULE.GHI_CHU_CUOC_GOI.code } } })
    if (!findRuleCommentCall) return false
    const findRuleDetailCommentCall = await model.RuleDetail.findAll({ where: { ruleId: { [Op.eq]: findRuleCommentCall.id } }, raw: true })
    const roles = user.roles
    let filterRole = []
    for (let i = 0; i < roles.length; i++) {
        const findRole = findRuleDetailCommentCall.filter(el => el.role == roles[i].role && el.unLimited == true)
        if (findRole.length) filterRole.push(findRole)
    }
    if (filterRole.length) return true
    return false
}

exports.checkRoleMark = async (req) => {
    let { user } = req
    if (user && user.roles.find(i => i.role == USER_ROLE.admin.n)) return true
    const findRuleMark = await model.Rule.findOne({ where: { code: { [Op.eq]: SYSTEM_RULE.CHAM_DIEM_CUOC_GOI.code } } })
    if (!findRuleMark) return false
    const findRuleDetailMark = await model.RuleDetail.findAll({ where: { ruleId: { [Op.eq]: findRuleMark.id } }, raw: true })
    const roles = user.roles
    let filterRole = []
    for (let i = 0; i < roles.length; i++) {
        const findRole = findRuleDetailMark.filter(el => el.role == roles[i].role && el.unLimited == true)
        if (findRole.length) filterRole.push(findRole)
    }
    if (filterRole.length) return true
    return false
}

exports.checkRoleScoreMission = async (req, res, next) => {
    let { user } = req
    if (user && user.roles.find(i => i.role == USER_ROLE.admin.n)) return next()
    const findRuleScoreMission = await model.Rule.findOne({ where: { code: { [Op.eq]: SYSTEM_RULE.CHAM_DIEM_CUOC_GOI.code } } })
    if (!findRuleScoreMission) return next(new Error('Đường dẫn menu đã bị thay đổi,vui lòng liên hệ quản trị để sửa đổi !'))
    const findRuleDetailScoreMission = await model.RuleDetail.findAll({ where: { ruleId: { [Op.eq]: findRuleScoreMission.id } }, raw: true })
    const roles = user.roles
    let filterRole = []
    for (let i = 0; i < roles.length; i++) {
        const findRole = findRuleDetailScoreMission.filter(el => el.role == roles[i].role && el.unLimited == true)
        if (findRole.length) filterRole.push(findRole)
    }
    if (filterRole.length) return next()
    return next(new Error('Không có quyền truy cập'))
}

exports.checkRoleScoreTarget = async (req, res, next) => {
    let { user } = req
    if (user && user.roles.find(i => i.role == USER_ROLE.admin.n)) return next()
    const findRuleScoreTarget = await model.Rule.findOne({ where: { code: { [Op.eq]: SYSTEM_RULE.CAU_HINH_MUC_TIEU_CHAM_DIEM.code } } })
    if (!findRuleScoreTarget) return next(new Error('Đường dẫn menu đã bị thay đổi,vui lòng liên hệ quản trị để sửa đổi !'))
    const findRuleDetailScoreTarget = await model.RuleDetail.findAll({ where: { ruleId: { [Op.eq]: findRuleScoreTarget.id } }, raw: true })

    const roles = user.roles
    let filterRole = []
    for (let i = 0; i < roles.length; i++) {
        const findRole = findRuleDetailScoreTarget.filter(el => el.role == roles[i].role && el.unLimited == 1)
        if (findRole.length) filterRole.push(findRole)
    }
    if (filterRole.length) return next()
    return next(new Error('Không có quyền truy cập'))
}

exports.checkRoleScoreScript = async (req, res, next) => {
    let { user } = req
    if (user && user.roles.find(i => i.role == USER_ROLE.admin.n)) return next()
    const findRuleScoreScript = await model.Rule.findOne({ where: { code: { [Op.eq]: SYSTEM_RULE.CAU_HINH_KICH_BAN_CHAM_DIEM.code } } })
    if (!findRuleScoreScript) return next(new Error('Đường dẫn menu đã bị thay đổi,vui lòng liên hệ quản trị để sửa đổi !'))
    const findRuleDetailScoreScript = await model.RuleDetail.findAll({ where: { ruleId: { [Op.eq]: findRuleScoreScript.id } }, raw: true })
    const roles = user.roles
    let filterRole = []
    for (let i = 0; i < roles.length; i++) {
        const findRole = findRuleDetailScoreScript.filter(el => el.role == roles[i].role && el.unLimited == true)
        if (findRole.length) filterRole.push(findRole)
    }
    if (filterRole.length) return next()
    return next(new Error('Không có quyền truy cập'))
}

exports.checkRoleViewData = async (req, res, next) => {
    let { user } = req
    if (user && user.roles.find(i => i.role == USER_ROLE.admin.n)) return next()
    const findRuleViewData = await model.Rule.findOne({ where: { code: { [Op.eq]: SYSTEM_RULE.XEM_DU_LIEU.code } } })
    if (!findRuleViewData) return next(new Error('Đường dẫn menu đã bị thay đổi,vui lòng liên hệ quản trị để sửa đổi !'))
    const findRuleDetailViewData = await model.RuleDetail.findAll({ where: { ruleId: { [Op.eq]: findRuleViewData.id } }, raw: true })
    const roles = user.roles
    let filterRole = []
    for (let i = 0; i < roles.length; i++) {
        const findRole = findRuleDetailViewData.filter(el => el.role == roles[i].role && el.isActive == true)
        if (findRole.length) filterRole.push(findRole)
    }
    if (filterRole.length) return next()
    return res.redirect('/default')
}