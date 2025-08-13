const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./mongodb/mongodb");
const setupSwagger = require("./swagger"); // Import Swagger setup

const app = express();

const userRouter = require('./routes/user.routes');
const jobRouter = require('./routes/job.routes');
const courseRouter = require('./routes/course.routes');
const applyJobRouter = require('./routes/applyJob.routes');
const dashboardRouter = require('./routes/dashboard.routes');
const adminDashboard = require('./routes/adminDashboard.routes');
const bookmarkRouter = require('./routes/bookmark.routes');
const paymentRouter=require('./routes/paymentRouter')
const categoryRouter=require('./routes/jobCategory.routes')
const cmsRouter=require('./routes/cms.routes');
const supportRouter=require('./routes/support.routes');
const bankRouter=require('./routes/bank.routes');
const reviewRouter=require('./routes/rating.routes');
const favCandidateRoutes = require("./routes/favCandidate.routes");
const productRoutes=require('./routes/product.routes')
const stripeRoutes=require('./routes/stripe.routes')
const notificationRoutes=require('./routes/notification.routes');
const { updateAfterPayment } = require("./helpers/updateafterpayment");

require("dotenv/config");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    let event = request.body;
    console.log(event.toString(), "....145");
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (process.env.WEBHOOK_SECRET) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      console.log(signature, "....151");
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          process.env.WEBHOOK_SECRET
        );
        console.log(event.type, "...........24");
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        console.log(event.data.object.metadata)
       await updateAfterPayment(event.data.object.metadata)
        

        // Then define and call a method to handle the successful payment intent.
       // handlePaymentIntentSucceeded(paymentIntent);
        break;
        case "payment_intent.created":
          const paymentCreate = event.data.object;
          console.log(
            `PaymentIntent for ${paymentCreate} was successful!`
          );
          // Then define and call a method to handle the successful payment intent.
         // handlePaymentIntentSucceeded(paymentIntent);
          break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        console.log(invoice, "..............272");

        // On payment successful, get subscription and customer details
        const subscription = await stripe.subscriptions.retrieve(
          event.data.object.subscription
        );
        const customer = await stripe.customers.retrieve(
          event.data.object.customer
        );

        console.log(
          subscription,
          customer,
          ".................58",
          invoice.billing_reason,
          ".......58"
        );

        if (invoice.billing_reason === "subscription_create") {
          // Handle the first successful payment
          // DB code to update the database for first subscription payment

          const subscriptionDocument = {
            userId: customer?.id,
            subscriptionId: subscription.id,
            subscriptionStartDate: subscription.current_period_start * 1000,
            subscriptionEndDate: subscription.current_period_end * 1000,
            email: subscription.email,
          };

          // // Insert the document into the collection
          const result = await SubscribedUser.create(subscriptionDocument);
          console.log(
            `A document was inserted with the _id: ${result.insertedId}`
          );
          console.log(
            `First subscription payment successful for Invoice ID: ${customer.email} ${customer?.metadata?.userId}`
          );
        } else if (
          invoice.billing_reason === "subscription_cycle" ||
          invoice.billing_reason === "subscription_update"
        ) {
          // Handle recurring subscription payments
          // DB code to update the database for recurring subscription payments

          // Define the filter to find the document with the specified userId
          const filter = { userId: customer?.metadata?.userId };

          // Define the update operation to set the new endDate
          const updateDoc = {
            $set: {
              subscriptionEndDate: subscription.current_period_end * 1000,
              // recurringSuccessful_test: true,
            },
          };

          // Update the document
          const result = await SubscribedUser.updateOne(filter, updateDoc);

          if (result.matchedCount === 0) {
            console.log("No documents matched the query. Document not updated");
          } else if (result.modifiedCount === 0) {
            console.log(
              "Document matched but not updated (it may have the same data)"
            );
          } else {
            console.log(`Successfully updated the document`);
          }
        }

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
   return  response.status(200).send();
  }
);



app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

// Initialize Swagger
setupSwagger(app);





// Routes
app.use('/api/user', userRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/applyJob',applyJobRouter);
app.use('/api/course', courseRouter);
app.use('/api/dashBoard', dashboardRouter);
app.use('/api/admin', adminDashboard);
app.use('/api/admin', adminDashboard);
app.use('/api/bookmark',bookmarkRouter);
app.use('/api/payment',paymentRouter);
app.use('/api/category',categoryRouter);
app.use('/api/cms',cmsRouter);
app.use('/api/support',supportRouter);
app.use('/api/bank',bankRouter);
app.use('/api/review',reviewRouter);
app.use('/api/favCandidate',favCandidateRoutes);
app.use('/api/product',productRoutes);
app.use('/api/stripe',stripeRoutes);
app.use('/api/notification',notificationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});
