const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const { tokenMiddlewareBoth, tokenMiddleware } = require("../middleware/token.middleware");
const productController = require('../controllers/product.controller');



router.post('/',tokenMiddleware,productController.CreateProduct);
router.put('/',tokenMiddleware,productController.UpdateProduct);
router.get('/',tokenMiddleware,productController.GetAllProducts);
router.delete('/',productController.DeleteProduct)



module.exports=router;
