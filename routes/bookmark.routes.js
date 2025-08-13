const express = require('express');
const router = express.Router();
const {tokenMiddleware, checkLogin} = require('../middleware/token.middleware');
const { getBookmarksByUser, updateBookmark } = require('../controllers/bookmarks.controllers');




router.get('/', tokenMiddleware,checkLogin,getBookmarksByUser);
router.post('/', tokenMiddleware,checkLogin,updateBookmark);



module.exports=router



