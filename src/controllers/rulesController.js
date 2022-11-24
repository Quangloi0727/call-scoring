
const model = require("../models")
const { TYPE_ROLETYPE, USER_ROLE_NOT_ADMIN, OP_TIME_DEFINE } = require("../helpers/constants")

const titlePage = "Quyền nâng cao"

exports.index = async (req, res, next) => {
  try {
    const rules = await model.Rule.findAll({
      include: [
        {
          model: model.RuleDetail,
          as: "RuleDetail",
        },
        {
          model: model.RuleType,
          as: "RuleType",
        },
      ],
      nest: true
    })
    
    return _render(req, res, "rules/index", {
      title: titlePage,
      titlePage: titlePage,
      ruleHasExpires: rules.filter(i => i.RuleType.type == TYPE_ROLETYPE.hasExpires.n),
      ruleOnlyTicks: rules.filter(i => i.RuleType.type == TYPE_ROLETYPE.onlyTick.n),
      TYPE_ROLETYPE,
      USER_ROLE_NOT_ADMIN,
      OP_TIME_DEFINE
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}