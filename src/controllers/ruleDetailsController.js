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
    let dataUpdate = {}

    if (expires) dataUpdate.expires = Number(expires)
    if (expiresType != undefined) dataUpdate.expiresType = Number(expiresType)
    if (isActive != undefined) dataUpdate.isActive = isActive == "true" ? true : false
    if (unLimited != undefined) dataUpdate.unLimited = unLimited == "true" ? true : false
    if (unLimited != undefined && unLimited == "true") {
      dataUpdate.expires = null
      dataUpdate.expiresType = null
    }

    //Khi mà bỏ tick xem không giới hạn với các quyền này thì mặc định để trong vòng 6 tháng
    const ruleViewData = [1, 2, 3, 4] //tương ứng với xem dữ liệu điện thoại viên,quản lý đội ngũ,người đánh giá và quản lý nhóm
    if (ruleViewData.includes(Number(id)) && unLimited == 'false') {
      dataUpdate.expiresType = 1
      dataUpdate.expires = 6
    }

    await model.RuleDetail.update(dataUpdate, { where: { id: Number(id) } }, { transaction: transaction })

    await transaction.commit()

    return res.status(SUCCESS_200.code).json({ message: "Success!" })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)

    if (transaction) await transaction.rollback()

    return res.status(ERR_500.code).json({ message: error.message })
  }
}
