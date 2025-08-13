const express = require("express");
const router = express.Router();
const favCandidateController = require("../controllers/favCandidate.controller");
const { tokenMiddleware, checkLogin } = require("../middleware/token.middleware");

// Route to mark a candidate as favorite
router.post("/favorite",tokenMiddleware,checkLogin, favCandidateController.markAsFavorite);

// Route to get all favorite candidates for an employer
router.get("/favorite/:employerId", tokenMiddleware,checkLogin,favCandidateController.getFavoriteCandidates);

module.exports = router;
