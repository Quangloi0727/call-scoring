const express = require('express');

const managePagesRouter = require('./pagesRouter');
const authRouter = require('./authRouter');
const recordingRouter = require('./recordingRouter');
const { isLoggedIn } = require('../libs/passport');

const router = express.Router();

router.use(authRouter);
router.use('/recording', isLoggedIn, recordingRouter)
router.use('/manage-pages', isLoggedIn, managePagesRouter);

module.exports = router;