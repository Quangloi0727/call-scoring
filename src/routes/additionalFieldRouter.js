const express = require('express')
const additionalFieldController = require('../controllers/additionalFieldController')
const router = express.Router()

router.route('/')
    .get(additionalFieldController.index)

module.exports = router