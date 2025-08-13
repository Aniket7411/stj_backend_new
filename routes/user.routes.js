const express = require('express');
const router = express.Router();
const {tokenMiddleware, checkLogin} = require('../middleware/token.middleware');


const {registerUser, logIn, verifyMail,updatePersonalInformation, updateGeneralInformation, updateUploads, getMyProfile, getProfile, search, findCandidate, verifyAndChangePassword, changePassword, sendVerifyMail, getUploadedData} = require("../controllers/user.controller");



router.post('/signup', registerUser);
router.post('/login', logIn);
router.post('/sendOtp', sendVerifyMail);
router.post('/changePassword', verifyAndChangePassword);
 router.post('/updatePassword', tokenMiddleware,checkLogin,changePassword);
router.get('/verify', verifyMail);
router.get('/profile/', tokenMiddleware, checkLogin, getMyProfile);
router.get('/profile/view', getProfile);
router.put('/profile/personal', tokenMiddleware, checkLogin, updatePersonalInformation);
router.put('/profile/general', tokenMiddleware, checkLogin, updateGeneralInformation);
router.get('/profile/uploads', tokenMiddleware, checkLogin, getUploadedData);
router.put('/profile/uploads', tokenMiddleware, checkLogin, updateUploads);
router.get('/search/', search);
router.get('/find',tokenMiddleware, checkLogin, findCandidate);

module.exports = router;