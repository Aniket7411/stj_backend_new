const express = require('express');
const router = express.Router();
const { getDashboard, addCategory, getCategory, getCourseManagement, coursePusblishRequest, getAdminManagement, addAdminManagement, deleteAdmin, getEmployersList, jobMangement, userManagement, deleteUser, editActiveUser, editVerificationUser } = require('../controllers/adminDashboard.controller');
const { tokenMiddleware, checkLogin } = require('../middleware/token.middleware');

//dashboard api
router.get('/', getDashboard);

//courseManagement api
router.post('/category', addCategory);
router.get('/category', getCategory);
router.get('/course', getCourseManagement);
router.put('/course', coursePusblishRequest);

//adminManagement api
router.get('/manage', getAdminManagement);
router.post('/manage', addAdminManagement);
router.delete('/manage/:email', deleteAdmin);

//employerManagement api
router.get('/employers',tokenMiddleware,checkLogin,getEmployersList);

router.get('/job', jobMangement);

//user management
router.get('/user',tokenMiddleware,checkLogin, userManagement);
router.put('/user/edit',tokenMiddleware,checkLogin,editActiveUser);
router.patch('/user/verify/:userId/:status',tokenMiddleware,checkLogin,editVerificationUser);
router.delete('/user/delete/:id',tokenMiddleware,checkLogin,deleteUser);

module.exports = router