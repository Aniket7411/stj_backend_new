const express = require('express');
const { tokenMiddleware, checkLogin } = require('../middleware/token.middleware');
const { createCms, getAllCMS, editOneCms, deleteCMS, getOneCms, addReview, getAllReviewsByJobId } = require('../controllers/ratings.controller');
const router = express.Router();



router.post('/',tokenMiddleware,checkLogin,addReview);
router.get('/',checkLogin,getAllReviewsByJobId);
// router.get('/single',getOneCms);
// router.put('/',tokenMiddleware,checkLogin,editOneCms);
// router.delete('/:id',tokenMiddleware,checkLogin,deleteCMS);


// router.delete('/:id',tokenMiddleware,checkLogin,deleteCategory)




module.exports=router










