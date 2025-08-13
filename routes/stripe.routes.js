const express = require("express");

const router = express.Router();
const bodyParser = require('body-parser');
const {tokenMiddleware } = require("../middleware/token.middleware");
const stripeController = require('../controllers/stripe.controller');

//router.post("/webhook");
// router.post("/create-payment-intent",createPaymentIntent,handleWebhook);

router.post("/create-checkout-session",tokenMiddleware,stripeController.createCheckout);
// router.get("/stripe-session/",tokenMiddleware(['Teacher','Institute']),stripeSession)



module.exports = router;
