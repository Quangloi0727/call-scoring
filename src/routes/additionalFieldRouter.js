const express = require('express')
const additionalFieldController = require('../controllers/additionalFieldController')
const router = express.Router()

router.route('/')
    .get(additionalFieldController.index)

router.route('/:id/edit')
    .put(additionalFieldController.edit)

module.exports = router