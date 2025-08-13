const express = require('express');
const { tokenMiddleware, checkLogin } = require('../middleware/token.middleware');
const { createJobApply, getJobApply, updateJobApply, getJobCompleted } = require('../controllers/applyJob.controller');
const router = express.Router();




router.post(
    '/create',
     tokenMiddleware, //!commenting these two lines just in case the payload is ready at the front end enable these
     checkLogin,
     createJobApply 
);


router.get(
    '/read',
     tokenMiddleware, //!commenting these two lines just in case the payload is ready at the front end enable these
     checkLogin,
     getJobApply 
);


router.get(
    '/read/complete',
     tokenMiddleware, //!commenting these two lines just in case the payload is ready at the front end enable these
     checkLogin,
     getJobCompleted 
);


router.put(
    '/update',
     tokenMiddleware, //!commenting these two lines just in case the payload is ready at the front end enable these
     checkLogin,
     updateJobApply 
);





module.exports=router







