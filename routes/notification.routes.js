const express = require('express');
const { tokenMiddleware, checkLogin } = require('../middleware/token.middleware');
const { getNotification } = require('../helpers/InAppNotification');
const router = express.Router();




router.get('/',tokenMiddleware,checkLogin,getNotification);





module.exports=router;