
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET); // Replace with your secret key




exports.CreatePayment = async (req, res) => {
    try {
        const { amount} = req.body;
    
        const paymentIntent = await stripe.paymentIntents.create({
          amount, // Amount in cents (e.g., $10 = 1000)
          currency: 'gbp',
        });
    
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
      }
};