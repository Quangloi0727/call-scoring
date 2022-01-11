const express = require('express');
const passport = require('passport');

const router = express.Router();

const pagesController = require('../controllers/pagesController');

router.get('/pages-active', passport.authenticate('basic', { session: false }), pagesController.getPagesActive)

module.exports = router;