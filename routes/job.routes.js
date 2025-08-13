const express = require('express');
const jobPostController = require('../controllers/jobs.controller');
const {checkLogin, tokenMiddleware, tokenMiddlewareBoth} = require('../middleware/token.middleware');

const router = express.Router();

router.post('/job-posts', tokenMiddleware, checkLogin, jobPostController.createJobPost);
router.get('/job-posts/employer', tokenMiddleware, checkLogin, jobPostController.getJobPostByEmployerId);
router.get('/job-posts',tokenMiddlewareBoth,checkLogin, jobPostController.getAllJobPosts);
router.get('/job-posts/:id', tokenMiddleware, checkLogin,jobPostController.getJobPostById);
router.put('/job-posts/:id', tokenMiddleware, checkLogin, jobPostController.updateJobPost);
router.delete('/job-posts/:id', tokenMiddleware, checkLogin, jobPostController.deleteJobPost);
router.post('/invite', tokenMiddleware, checkLogin, jobPostController.addInvitedCandidates);
router.get('/invite', tokenMiddleware, checkLogin, jobPostController.getJobInvitations);

module.exports = router;
