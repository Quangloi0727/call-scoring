const { getRepository, Between, Like } = require('typeorm');
const pagination = require('pagination');
const moment = require('moment');
const User = require('../entities/UserSchema');
const { createExcelPromise } = require('../common/createExcel')
const {
    SUCCESS_200,
    ERR_400,
    ERR_404,
    ERR_500
} = require("../helpers/constants/statusCodeHTTP");

const titlePage = 'Danh sách cuộc gọi';

exports.index = async (req, res, next) => {
    try {
        return res.render('pages/index', {
            page: 'users/index',
            title: titlePage,
            titlePage: titlePage,
        });
    } catch (error) {
        console.log(`------- error ------- `);
        console.log(error);
        console.log(`------- error ------- `);
        return next(error);
    }
}