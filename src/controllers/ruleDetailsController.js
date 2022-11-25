const model = require("../models")
const { SUCCESS_200, ERR_500 } = require("../helpers/constants")

exports.create = async (req, res) => {
  let transaction

  try {
    let { expires, expiresType, ruleId, role, unLimited } = req.body

    transaction = await model.sequelize.transaction()

    if (expires != undefined) expires = Number(expires)
    if (expiresType != undefined) expiresType = Number(expiresType)
    if (ruleId != undefined) ruleId = Number(ruleId)
    if (role != undefined) role = Number(role)
    if (unLimited != undefined) unLimited = unLimited == "true" ? true : false

    let result = await model.RuleDetail.create(
      { expires, expiresType, ruleId, role, unLimited },
      { transaction: transaction }
    )

    await transaction.commit()

    return res.status(SUCCESS_200.code).json({
      message: "Success!",
      data: result
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)

    if (transaction) await transaction.rollback()

    return res.status(ERR_500.code).json({ message: error.message })
  }
}

exports.update = async (req, res) => {
  let transaction

  try {
    const { id } = req.params
    const { expires, expiresType, unLimited, isActive } = req.body

    transaction = await model.sequelize.transaction()

    if (!id) {
      throw new Error("id Không hợp lệ!")
    }

    let dataUpdate = {}

    if (expires) dataUpdate.expires = Number(expires)
    if (expiresType != undefined) dataUpdate.expiresType = Number(expiresType)
    if (isActive != undefined) dataUpdate.isActive = isActive == "true" ? true : false
    if (unLimited != undefined) dataUpdate.unLimited = unLimited == "true" ? true : false
    if (unLimited != undefined && unLimited == "true") {
      dataUpdate.expires = null
      dataUpdate.expiresType = null
    }

    await model.RuleDetail.update(
      dataUpdate,
      { where: { id: Number(id) } },
      { transaction: transaction }
    )

    await transaction.commit()

    return res.status(SUCCESS_200.code).json({
      message: "Success!",
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)

    if (transaction) await transaction.rollback()

    return res.status(ERR_500.code).json({ message: error.message })
  }
}
