const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const password = require("../middleware/password")
const ctrlEmail = require('../middleware/ctrlEmail')


router.post('/signup', password, ctrlEmail, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
