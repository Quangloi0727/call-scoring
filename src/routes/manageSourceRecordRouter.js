const express = require('express')
const manageSourceRecordController = require('../controllers/manageSourceRecordController')
const router = express.Router()

router.route('/')
    .get(manageSourceRecordController.index)
    .post(manageSourceRecordController.create)

router.route('/:id')
    .put(manageSourceRecordController.update)

router.route('/:id/updateStatus')
    .put(manageSourceRecordController.updateStatus)

router.route('/getListSource')
    .get(manageSourceRecordController.getListSource)

router.route('/:id/detail')
    .get(manageSourceRecordController.detail)

router.route('/:id/detail')
    .get(manageSourceRecordController.detail)

router.route('/saveFileServer')
    .post(manageSourceRecordController.saveFileServer)

    
router.route('/checkShhFileServer')
    .post(manageSourceRecordController.checkShhFileServer)
    

module.exports = router