const express = require('express')
const manageSourceRecordController = require('../controllers/manageSourceRecordController')
const router = express.Router()

router.route('/')
    .get(manageSourceRecordController.index)
    .post(manageSourceRecordController.create)

router.route('/getListSource')
    .get(manageSourceRecordController.getListSource)

// router.route('/new')
//     .get(manageSourceRecordController.new)

module.exports = router