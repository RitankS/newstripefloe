import express from "express";
import cors from "cors";
import bodyparser from 'body-parser';
import CircularJSON from "circular-json";
import stripe from "stripe";

const app = express();
const port = process.env.PORT || 2001; // Use the provided port or default to 2001

app.use(cors());
app.use(express.json());
app.use(bodyparser.json());

//const STRIPE_KEY = process.env.STRIPE_KEY; // Make sure to set your Stripe API key as an environment variable

app.post("/pay", async (req, res) => {
    const STRIPE_KEY = "sk_test_51Nv0dVSHUS8UbeVicJZf3XZJf72DL9Fs3HP1rXnQzHtaXxMKXwWfua2zi8LQjmmboeNJc3odYs7cvT9Q5YIChY5I00Pocly1O1"
    const { price, name, custName, email } = req.body;
    const Stripe = new stripe(STRIPE_KEY);

    try {
        const newPrice = Math.ceil(parseFloat(price));
      
        const customer = await Stripe.customers.create({
            name: custName,
        });
        const custId = customer.id
        const myPrice = await Stripe.prices.create({
            currency: 'INR',
            unit_amount: newPrice,
            product_data: {
                name: name,
            },
        });

        const priceId = myPrice.id;
        const session = await Stripe.checkout.sessions.create({
            success_url: 'https://example.com/success',
            line_items: [
                {
                    price: priceId,
                    quantity: 10,
                },
            ],
            mode: 'payment',
        });
        res.status(200).json(CircularJSON.stringify({ priceId , email  , session}));
    } catch(err) {
        res.status(500).json(CircularJSON.stringify({err: err.message}));
    }
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
