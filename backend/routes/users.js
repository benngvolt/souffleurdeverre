const express = require ('express');
const router = express.Router();
const usersCtrl = require ('../controllers/users');

// router.post('/signup', usersCtrl.signUp);
router.post('/', usersCtrl.logIn);

module.exports = router;