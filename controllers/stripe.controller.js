const ProductPrice = require("../models/product.model");
const User = require("../models/user.model");

const stripe = require("stripe")(process.env.STRIPE_SECRET);

// Load the signing secret from environment variables
const endpointSecret = process.env.WEBHOOK_SECRET




// STRIPE_SECRET='
// _51RA9JEBGPT6A0TLB73Jep1MgFR3XifTvUZGmhiGDtjTmvDkErWGCKCYPj3FusuUB6qMKW099qwd3qT4gOzEHp5uI000gopTn6f'
// WEBHOOK_SECRET='whsec_IZ3Ro249rHrTMjFXEuOTdFrls3Pd4Cob'








const priceMap = {
  silver: {
    monthly: 'price_1QpiCkSGoMPFaHdYH0bcBbdj',
   // yearly: 'price_silver_yearly_id',
  },
  gold: {
    monthly: 'price_1QpiDwSGoMPFaHdYUcDOQnVM',
   // yearly: 'price_gold_yearly_id',
  },
  platinum: {
    monthly: 'price_1QplDbSGoMPFaHdYufXdGYzZ',
   // yearly: 'price_platinum_yearly_id',
  },
};


exports.createPaymentIntent = async (req, res) => {
    const { amount, currency = "usd" } = req.body;
  
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount specified" });
    }
  
    try {
      // Create a payment intent with amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency,
      });
  
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Payment intent creation failed" });
    }
  };


exports.handleWebhook = (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    //console.log('hello.......37')
  
    try {
      // Verify the Stripe event
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event based on the event type
    switch (event.type) {
     
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent);
        // Add your business logic here
        break;
      case "payment_intent.payment_failed":
        const failedIntent = event.data.object;
        console.log("Payment failed:", failedIntent);
        // Handle the failed payment here
        break;
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Checkout session completed:", session);
        // Handle successful checkout session
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  };

exports.createCheckout=async (req, res,next) => {
  try {
    const {product,paidFor,credits,jobId,courseId,}=req.body;
    const {email,userId}=req.user;
   // const priceId = priceMap[subscriptionType.toLowerCase()];
    //priceId should come from database if needed....

    let checkProduct;
    if(paidFor==='course'){
      checkProduct=await ProductPrice.findOne({'product.id':product});
    }
    else 
     checkProduct=await ProductPrice.findOne({'product.name':product});
    

    if(!checkProduct){
      return res.status(400).send({
        message:"this product does not exist",
        success:false
      })
    }


  
    const session = await stripe.checkout.sessions.create(
      {
        //for adding tax , we need to ask about to client
  //   automatic_tax: {
  //   enabled: false,
  //   liability: null,
  //   status: null
  // },
  client_reference_id:userId,
 // customer:email,
  customer_email:email,
  line_items:[{
    price:checkProduct.priceData.id,
    quantity:paidFor==='credits'?credits:1

  }],
  metadata:{
    paidFor:paidFor,  // it can be course , credit, featured
    credits:credits,
    userId:userId,
    jobId:jobId,
    courseId:courseId
  },
  mode:'payment',
 // return_url:'https://stj-lime.vercel.app/',
  // success_url:'https://stj-lime.vercel.app/',
    success_url:'https://stj-frontend-n.vercel.app/',

 


      }
    );
    console.log("session: ", session.id, session.url, session)

    // get id, save to user, return url
    const sessionId = session.id;
    console.log("sessionId: ", sessionId);

    await User.findOneAndUpdate({userId:req?.user?.userId},{
      $set:{
        sessionId:sessionId
      }
    })

    // save session.id to the user in your database


     res.json({ url: session.url ,success:true})
    //next()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}



exports.stripeSession= async (req, res) => {
  console.log("req.body: ", req.body);
  const { userId } = req.user;
  console.log("userId: ", userId);

  //const db = req.app.get('db');

  // get user from you database
  // const user = {
  //   stripe_session_id: "asdfpouhwf;ljnqwfpqo",
  //   paid_sub: false
  // }

  const userData=await Educator_info.findById(userId);
  console.log(userData?.sessionId,"..................149")


  if(!userData.sessionId) 
  return res.send("fail");

  try {
      // check session
      const session = await stripe.checkout.sessions.retrieve(userData.sessionId);
      console.log("session: ", session);

      // const sessionResult = {
      //   id: 'cs_test_a1lpAti8opdtSIDZQIh9NZ6YhqMMwC0H5wrlwkUEYJc6GXokj2g5WyHkv4',
      //   …
      //   customer: 'cus_PD6t4AmeZrJ8zq',
      //   …
      //   status: 'complete',
      //   …
      //   subscription: 'sub_1OOgfhAikiJrlpwD7EQ5TLea',
      //  …
      // }
      
    
      // update the user
      if (session && session.status === "complete") {
        console.log("session-142.............",session)
        let updatedUser = await Educator_info.findByIdAndUpdate(
          userId,
         {
          $set:{
            subscriptionType:session?.metadata?.productName
            
          }
         }
        );
        updatedUser = updatedUser[0];
        console.log(updatedUser);
    
        return res.send("success");
      } else {
        return res.send("fail");
      }
  } catch (error) {
      // handle the error
      console.error("An error occurred while retrieving the Stripe session:", error);
      return res.send("fail");
  }
}




//payout functionality is left and integration
  
