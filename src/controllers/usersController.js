const { getRepository, Between, Like, getConnection } = require('typeorm');
const pagination = require('pagination');
const moment = require('moment');
const User = require('../entities/UserSchema');
const {
    SUCCESS_200,
    ERR_400,
    ERR_404,
    ERR_500
} = require("../helpers/constants/statusCodeHTTP");

const titlePage = 'Danh sách cuộc gọi';

exports.index = async (req, res, next) => {
    try {
        let limit = 25;
        let pageNumber = 1;
        let offset = 0;
        let _User = getRepository(User);
        const recordResult = await _User.findAndCount({
            order: {
                createAt: 'DESC'
            },
            skip: offset,
            take: limit,
        });
        let paginator = new pagination.SearchPaginator({
            current: pageNumber,
            rowsPerPage: limit,
            totalResult: recordResult && recordResult[1] ? recordResult[1] : 0,
        });
        return res.render('pages/index', {
            page: 'users/index',
            title: titlePage,
            titlePage: titlePage,
            data: recordResult && recordResult[0] && recordResult.length > 0 ? recordResult[0] : [],
            paginator: paginator.getPaginationData(),
        });
    } catch (error) {
        console.log(`------- error ------- `);
        console.log(error);
        console.log(`------- error ------- `);
        return next(error);
    }
}
exports.getUsers = async (req, res, next) => {
    try {
        let { page, extension, username, fullname } = req.query;
        let limit = 25;
        let pageNumber = page ? Number(page) : 1;
        let offset = (pageNumber * limit) - limit;
        let query = {};
        let _User = getRepository(User);
        if (username) query.username = Like(`%${username}%`);
        if (fullname) query.fullname = Like(`%${fullname}%`);
        if (extension) query.extension = Like(`%${extension}%`);
        const recordResult = await _User.findAndCount({
            where: {
                ...query
            },
            order: {
                createAt: 'DESC'
            },
            skip: offset,
            take: limit,
        });
        let paginator = new pagination.SearchPaginator({
            current: pageNumber,
            rowsPerPage: limit,
            totalResult: recordResult && recordResult[1] ? recordResult[1] : 0,
        });
        return res.status(SUCCESS_200.code).json({
            message: 'Success!',
            data: recordResult && recordResult[0] && recordResult.length > 0 ? recordResult[0] : [],
            paginator: paginator.getPaginationData(),
        });
    } catch (error) {
        console.log(`------- error ------- `);
        console.log(error);
        console.log(`------- error ------- `);
        return res.status(ERR_500.code).json({ message: error.message });
    }
}
exports.createUser = async (req, res, next) => {
    try {

        let data = req.body
        data.role = 0;
        data.fullname = data.firstname + " " + data.lastname;
        delete data.repeat_password;
        delete data.lastname;
        delete data.firstname
        data.createAt = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');
        data.createBy = 'admin';

        let _User = getRepository(User);
        const newUser = await _User.save(data);
        return res.status(SUCCESS_200.code).json({
            message: 'Success!',
        });
    } catch (error) {
        console.log(`------- error ------- getRecording`);
        console.log(error);
        console.log(`------- error ------- getRecording`);

        return res.status(ERR_500.code).json({ message: error.message });
    }
} 