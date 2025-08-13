const express = require("express");
const router = express.Router();
const { createBankDetails, getBankDetails, deleteBankDetails, replaceBankDetails } = require("../controllers/bank.controller.js");
const { tokenMiddleware, checkLogin } = require("../middleware/token.middleware.js");

// POST API - Add Bank Details
router.post("/bank-details",tokenMiddleware,checkLogin,createBankDetails);

// GET API - Retrieve Bank Details by User ID
router.get("/bank-details/:userId",tokenMiddleware,checkLogin, getBankDetails);
router.delete("/bank-details/:userId",tokenMiddleware,checkLogin, deleteBankDetails);
router.put("/bank-details/:userId",tokenMiddleware,checkLogin, replaceBankDetails);


module.exports = router;
