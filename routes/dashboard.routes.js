const express = require('express');
const router =  express.Router()
const {getDashboard, updateDashboard} = require('../controllers/dashboard.controller');
const { tokenMiddleware, checkLogin } = require('../middleware/token.middleware');

router.get('/',tokenMiddleware,checkLogin, getDashboard);
router.put('/', updateDashboard);



module.exports=router;