const express = require('express')
const manageSourceRecordController = require('../controllers/manageSourceRecordController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')

router.route('/')
    .get(isLoggedIn, isAdmin, manageSourceRecordController.index)
    .post(isLoggedIn, isAdmin, manageSourceRecordController.create)

router.route('/:id')
    .put(isLoggedIn, isAdmin, manageSourceRecordController.update)

router.route('/:id/updateStatus')
    .put(isLoggedIn, isAdmin, manageSourceRecordController.updateStatus)

router.route('/getListSource')
    .get(isLoggedIn, isAdmin, manageSourceRecordController.getListSource)

router.route('/:id/detail')
    .get(isLoggedIn, isAdmin, manageSourceRecordController.detail)

router.route('/:id/detail')
    .get(isLoggedIn, isAdmin, manageSourceRecordController.detail)

router.route('/saveFileServer')
    .post(isLoggedIn, isAdmin, manageSourceRecordController.saveFileServer)


router.route('/checkShhFileServer')
    .post(isLoggedIn, isAdmin, manageSourceRecordController.checkShhFileServer)


module.exports = router