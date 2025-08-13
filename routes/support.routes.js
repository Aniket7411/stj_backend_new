const express = require('express');
const { tokenMiddleware, checkLogin } = require('../middleware/token.middleware');
const { createSupport, getAllSupport } = require('../controllers/support.controllers');
const router = express.Router();



router.post('/',tokenMiddleware,checkLogin,createSupport);
router.get('/',checkLogin,getAllSupport);


// router.delete('/:id',tokenMiddleware,checkLogin,deleteCategory)




module.exports=router










