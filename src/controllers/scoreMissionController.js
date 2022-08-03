
const { Op, QueryTypes } = require('sequelize')
const pagination = require('pagination')
const UserModel = require('../models/user')
const UserRoleModel = require('../models/userRole')
const titlePage = 'Nhiệm vụ chấm điểm'

exports.index = async (req, res, next) => {
    try {


        return _render(req, res, 'scoreMission/index', {
            title: titlePage,
            titlePage: titlePage,

            // USER_ROLE,
            // STATUS_SCORE_SCRIPT
        })
    } catch (error) {
        console.log(`------- error ------- `)
        console.log(error)
        console.log(`------- error ------- `)
        return next(error)
    }
}