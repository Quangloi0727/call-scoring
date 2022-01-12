const express = require('express');

const authRouter = require('./authRouter');
const recordingRouter = require('./recordingRouter');
const { isLoggedIn } = require('../libs/passport');

const router = express.Router();

router.use(authRouter);
router.use('/recording', isLoggedIn, recordingRouter)

module.exports = router;