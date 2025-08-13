const stripe = require("stripe")(process.env.STRIPE_SECRET);
const ProductPrice = require("../models/product.model");
// const Subscription = require("../Models/SubscriptionModal"); // Import the Subscription model


exports.CreateProduct = async (req, res) => {
    try {
      const {productName,type,price,description} = req.body;
  
      // Create the product in Stripe
      
      const checkProduct=await ProductPrice.findOne({"product.name":productName});
      if(checkProduct){
        return res.status(404).send({
          message:'this product already exist',
          success:false
        })
      }
      const product = await stripe.products.create({
        name: productName,
        description: description,
        metadata: {
          type:type,
          createdBy:req.user.userId,
          role:req.user.role
        },
        
      });
  
      // Create price for the product
      const priceData = await stripe.prices.create({
        unit_amount: price*100, // Convert  cents to pound for Stripe
        currency: 'gbp',
        product: product.id,
      });
  
      // Save to MongoDB
      const productPriceData = new ProductPrice({
        product: {
          id: product.id,
          object: product.object,
          active: product.active,
          attributes: product.attributes,
          created: product.created,
          default_price: product.default_price,
          description: product.description,
          images: product.images,
          livemode: product.livemode,
          marketing_features: product.marketing_features,
          metadata: product.metadata,
          name: product.name,
          package_dimensions: product.package_dimensions,
          shippable: product.shippable,
          statement_descriptor: product.statement_descriptor,
          tax_code: product.tax_code,
          type: product.type,
          unit_label: product.unit_label,
          updated: product.updated,
          url: product.url,
  
        },
        priceData: {
          id: priceData.id,
          object: priceData.object,
          active: priceData.active,
          billing_scheme: priceData.billing_scheme,
          created: priceData.created,
          currency: priceData.currency,
          custom_unit_amount: priceData.custom_unit_amount,
          livemode: priceData.livemode,
          lookup_key: priceData.lookup_key,
          metadata: priceData.metadata,
          nickname: priceData.nickname,
          product: priceData.product,
          recurring: priceData.recurring,
          tax_behavior: priceData.tax_behavior,
          tiers_mode: priceData.tiers_mode,
          transform_quantity: priceData.transform_quantity,
          type: priceData.type,
          unit_amount: priceData.unit_amount,
          unit_amount_decimal: priceData.unit_amount_decimal,
  
        }

      });
  
      await productPriceData.save();
  
      return res.status(200).send({
        success: true,
        message: "Product created and stored successfully",
        product,
        priceData,
      });
    } catch (err) {
      return res.status(500).send({
        message: err.message || "Internal Server Error",
        success: false,
      });
    }
  };


exports.CreateProductFunction = async (data) => {
    try {
      const {productName,price,description,courseId,userId} = data;
  
      // Create the product in Stripe
      
     // const checkProduct=await ProductPrice.findOne({"product.name":productName});
      // if(checkProduct){
      //   return res.status(404).send({
      //     message:'this product already exist',
      //     success:false
      //   })
      // }
      const product = await stripe.products.create({
        name: productName,
        description: description,
        metadata: {
          type:'employer',
          createdBy:userId,
          role:'employer',
          courseId:courseId,
        },
        
      });
  
      // Create price for the product
      const priceData = await stripe.prices.create({
        unit_amount: price*100, // Convert to cents for Stripe
        currency: 'eur',
        product: product.id,
      });
  
      // Save to MongoDB
      const productPriceData = new ProductPrice({
        product: {
          id: product.id,
          object: product.object,
          active: product.active,
          attributes: product.attributes,
          created: product.created,
          default_price: product.default_price,
          description: product.description,
          images: product.images,
          livemode: product.livemode,
          marketing_features: product.marketing_features,
          metadata: product.metadata,
          name: product.name,
          package_dimensions: product.package_dimensions,
          shippable: product.shippable,
          statement_descriptor: product.statement_descriptor,
          tax_code: product.tax_code,
          type: product.type,
          unit_label: product.unit_label,
          updated: product.updated,
          url: product.url,
  
        },
        priceData: {
          id: priceData.id,
          object: priceData.object,
          active: priceData.active,
          billing_scheme: priceData.billing_scheme,
          created: priceData.created,
          currency: priceData.currency,
          custom_unit_amount: priceData.custom_unit_amount,
          livemode: priceData.livemode,
          lookup_key: priceData.lookup_key,
          metadata: priceData.metadata,
          nickname: priceData.nickname,
          product: priceData.product,
          recurring: priceData.recurring,
          tax_behavior: priceData.tax_behavior,
          tiers_mode: priceData.tiers_mode,
          transform_quantity: priceData.transform_quantity,
          type: priceData.type,
          unit_amount: priceData.unit_amount,
          unit_amount_decimal: priceData.unit_amount_decimal,
  
        }

      });
  
      await productPriceData.save();
  
      // return res.status(200).send({
      //   success: true,
      //   message: "Product created and stored successfully",
      //   product,
      //   priceData,
      // });

      return { success:true,productId:productPriceData.product.id}
    } catch (err) {
      return { success:false ,message:err.message}
      
    }
  };
  
  
  
  
  
  //Update api 
exports.UpdateProduct = async (req, res) => {
    try {
      const {productName,type,price,description} = req.body;
  
      // Create the product in Stripe
      
  
      const checkProduct=await ProductPrice.findOne({"product.name":productName});
      if(!checkProduct){
        return res.status(400).send({
          message:'this product does not exist',
          success:false
        })
      }
      const product = await stripe.products.update(checkProduct.product.id,{
        name: productName,
        description: description,
        metadata: {
          type:type,
          createdBy:req.user.userId,
          role:req.user.role
        },  
      });
  
      // Create price for the product
      const priceData = await stripe.prices.create({
        unit_amount: price*100, // Convert to cents for Stripe
        currency: 'eur',
        product: product.id,
      });

      console.log(priceData.id);
  
      // Save to MongoDB
      const productPriceData = await ProductPrice.findByIdAndUpdate(
  checkProduct._id,
  {
    $set: {
      product: {
        id: product.id,
        object: product.object,
        active: product.active,
        attributes: product.attributes,
        created: product.created,
        default_price: product.default_price,
        description: product.description,
        images: product.images,
        livemode: product.livemode,
        marketing_features: product.marketing_features,
         metadata: {
          type:type,
          createdBy:req.user.userId,
          role:req.user.role
        },  
        name: product.name,
        package_dimensions: product.package_dimensions,
        shippable: product.shippable,
        statement_descriptor: product.statement_descriptor,
        tax_code: product.tax_code,
        type: product.type,
        unit_label: product.unit_label,
        updated: product.updated,
        url: product.url
      },
      priceData: {
        id: priceData.id,
        object: priceData.object,
        active: priceData.active,
        billing_scheme: priceData.billing_scheme,
        created: priceData.created,
        currency: priceData.currency,
        custom_unit_amount: priceData.custom_unit_amount,
        livemode: priceData.livemode,
        lookup_key: priceData.lookup_key,
        metadata: {
          type:type,
          createdBy:req.user.userId,
          role:req.user.role
        },  
        nickname: priceData.nickname,
        product: priceData.product,
        recurring: priceData.recurring,
        tax_behavior: priceData.tax_behavior,
        tiers_mode: priceData.tiers_mode,
        transform_quantity: priceData.transform_quantity,
        type: priceData.type,
        unit_amount: priceData.unit_amount,
        unit_amount_decimal: priceData.unit_amount_decimal
      }
    }
  },
  { new: true } // return the updated document
);

  
      await productPriceData.save();
  
      return res.status(200).send({
        success: true,
        message: "Product updated and stored successfully",
        product,
        priceData,
      });
    } catch (err) {
      return res.status(500).send({
        message: err.message || "Internal Server Error",
        success: false,
      });
    }
  };
  
  
  
  //Read all the products
  exports.GetAllProducts = async (req, res) => {
    try {
      const {productType}=req.query;
      const productsResponse = await stripe.products.list({ limit: 100,active:true});
     let products = productsResponse.data.filter((product) => {
  console.log(product, "..............325");
  return product.metadata.role === productType;
});

  
      // Fetch prices and map them with corresponding products
      const pricesResponse = await stripe.prices.list({ limit: 100 });
      const prices = pricesResponse.data;
  
      // Map prices to products by product ID
      const productsWithPrices = products.map((product) => {
        const productPrices = prices.filter((price) => price.product === product.id);
        return {
          ...product,
          prices: productPrices, // Attach price data to the product
        };
      });
  
      return res.status(200).send({
        success: true,
        products: productsWithPrices,
      });
    } catch (err) {
      return res.status(500).send({
        message: err.message || "Failed to fetch products",
        success: false,
      });
    }
  };
  
  
  
  
  //Delete a product
  exports.DeleteProduct = async (req, res) => {
    try {
      const { productId } = req.body;
  
      // Archive the product in Stripe (Stripe doesn't fully delete products)
      const deletedProduct = await stripe.products.update(productId, {
        active: false,
      });
  
      return res.status(200).send({
        success: true,
        message: "Product deleted successfully",
        deletedProduct,
      });
    } catch (err) {
      return res.status(500).send({
        message: err.message || "Internal Server Error",
        success: false,
      });
    }
  };