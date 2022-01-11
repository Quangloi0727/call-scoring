const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { isLoggedIn } = require('../libs/passport');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', isLoggedIn, authController.logout);

router.get('/', isLoggedIn, authController.getIndex)

module.exports = router;