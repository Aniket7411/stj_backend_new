const express = require('express');
const { CreatePayment } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create',CreatePayment);
  
module.exports = router;