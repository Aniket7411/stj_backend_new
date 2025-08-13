const express = require('express');
const router = express.Router();
const {tokenMiddleware, checkLogin} = require('../middleware/token.middleware');
const { createCategory, getAllCategory, deleteCategory } = require('../controllers/jobCategory.controller');


router.post('/',tokenMiddleware,checkLogin,createCategory)
router.get('/',checkLogin,getAllCategory)
router.delete('/:id',tokenMiddleware,checkLogin,deleteCategory)



module.exports=router