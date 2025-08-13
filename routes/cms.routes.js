const express = require('express');
const { tokenMiddleware, checkLogin } = require('../middleware/token.middleware');
const { createCms, getAllCMS, editOneCms, deleteCMS, getOneCms, getCMSByEndPoint } = require('../controllers/cms.controller');
const router = express.Router();



router.post('/',tokenMiddleware,checkLogin,createCms);
router.get('/',checkLogin,getAllCMS);
router.get('/endpoint',checkLogin,getCMSByEndPoint);
router.get('/single',getOneCms);
router.put('/',tokenMiddleware,checkLogin,editOneCms);
router.delete('/:id',tokenMiddleware,checkLogin,deleteCMS);


// router.delete('/:id',tokenMiddleware,checkLogin,deleteCategory)




module.exports=router










