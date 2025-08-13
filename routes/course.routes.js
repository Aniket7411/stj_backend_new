const express = require('express');
const router = express.Router();
const  {createCourse, getAllCourses, getCourseById, deleteCourseById, getPurchasedCourse, getCourseForAdmin} = require('../controllers/courseController');
const {checkLogin, tokenMiddleware, tokenMiddlewareBoth} = require('../middleware/token.middleware');


// Route to create a course
router.post(
    '/create',
     tokenMiddleware, //!commenting these two lines just in case the payload is ready at the front end enable these
     checkLogin,
     createCourse
);
router.get('/get',tokenMiddlewareBoth,checkLogin, getAllCourses);
router.get('/purchased',tokenMiddlewareBoth,checkLogin, getPurchasedCourse);
router.delete('/:id',tokenMiddlewareBoth,checkLogin, deleteCourseById);
router.get('/get/:id', getCourseById);
router.get('/get/admin/data',tokenMiddleware,checkLogin,getCourseForAdmin);

module.exports = router;
