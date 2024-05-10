import CircularJSON from "circular-json";
import nodemailer from "nodemailer"
import stripe from "stripe";
import https from "https"
import cron from "node-cron"
import open from "open"

const STRIPE_KEY = 'sk_test_51Nv0dVSHUS8UbeVicJZf3XZJf72DL9Fs3HP1rXnQzHtaXxMKXwWfua2zi8LQjmmboeNJc3odYs7cvT9Q5YIChY5I00Pocly1O1';


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'saxena.ritank@gmail.com',
        pass: 'jxtyxdltbkihtcpc'
    }
});


export const getTheWebHookPayLoad = async(req,res)=>{
    
    try {
        const payload = req.body; // Remove destructuring, assuming payload is the entire body
        // Process the payload as needed
        console.log(payload)
        // Send a response with the received payload
        return payload
    }
    catch(err){
        return err.message
    }
}


const checkLastInteger = async (url) => {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                
                const matches = responseData.match(/\d+/g);

                if (matches && matches.length >= 2) {
                    const lastTwo = matches.slice(-2).map(Number);
                    resolve(lastTwo);
                } else {
                    reject(new Error('Could not extract last two integers from the string'));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
};

export const getTheInteger = async (req, res) => {
    const {url} = req.body
    try {
        const number = await checkLastInteger(url);
        res.status(200).json(CircularJSON.stringify({ number }));
    } catch (err) {
        res.status(500).json(CircularJSON.stringify({ err: err.message }));
    }
};

const payload = {
    "id": 80
}






//opening the url in another browser
export const openUrl = async (req, res) => {
    try {
      const url = req.body.url; // Access the `url` property within `req.body`
  
      console.log("url is ", url);
  
      await open(url, { app: { name: 'Chrome' } }); // Specify the browser app
  
      console.log(`Opened ${url} in the default browser.`);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error opening ${url}:`, error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  
export const startStripeFlow = async(req,res)=>{
    try{
        const flow = await fetch('https://n8ncrcl.nanoheal.work/webhook/startstripe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        res.status(200).json(CircularJSON.stringify({flow}))
    }
    catch(err){
        res.status(500).json(CircularJSON.stringify({err: err.message}))
    }
}


export const sendEmail = async (req, res) => {
    const { subject, des  , email} = req.body;

    try {

        let mailOptions = {
            from: 'saxena.ritank@gmail.com',
            to: email,
            subject,
            text: des
        };

        // Send email asynchronously
        const response = await transporter.sendMail(mailOptions);

        console.log('Email sent: ' + response.messageId);
        res.status(200).json(CircularJSON.stringify({ response }));
    } catch (error) {
        console.error(error);
        res.status(500).json(CircularJSON.stringify({ error: error.message }));
    }
};

let priceId
export const takePrice = async (req, res) => {
    const Stripe = new stripe(STRIPE_KEY)
    try {
      const { price, name, custName , email } = req.body;
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
      })
  
      priceId = myPrice.id;
      res.status(200).json(CircularJSON.stringify({ priceId , email }));
    } catch (error) {
      res.status(500).json(CircularJSON.stringify({ error: error.message }));
      console.log(error)
    }
  };

export const createSession = async(req,res)=>{
    const {priceId , email} = req.body
    const Stripe = new stripe(STRIPE_KEY)
    try{
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
          res.status(200).json(CircularJSON.stringify({session , email}))
    }
    catch(err){
        res.status(500).json(CircularJSON.stringify({err: err.message}))
    }
}

export const monthlySubs = async (req, res) => {
    const Stripe = new stripe(STRIPE_KEY)
    try {
      const { custName, price, name , email} = req.body;
      const newPrice = Math.ceil(parseFloat(price));
  
      const customer = await Stripe.customers.create({ name: custName });
      const custId = customer.id;
  
      const newprice = await Stripe.prices.create({
        currency: 'inr',
        unit_amount: newPrice * 100,
        recurring: { interval: 'month' },
        product_data: { name: name },
      });
  
      priceId = newprice.id;
  
      const session = await Stripe.checkout.sessions.create({
        customer: custId,
        success_url: 'http://localhost:3110/payments/sessionstatus',
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
      });
  
      subssessionsId = session.id;
      res.status(200).json(CircularJSON.stringify({ session , email }));
    } catch (error) {
      res.status(500).json(CircularJSON.stringify({ error: error.message }));
    }
  };


  export const testingPublicAPI = async(req,res)=>{
    const {payload} = req.body
    try{
               const response  =await fetch('https://catfact.ninja/fact', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
               })

               if(response.ok){
                const data = await response.json()
                console.log(data)
               }
    }
    catch(err){
        return err.message
    }
  }

//   cron.schedule('*/2 * * * * *', async () => {
//     console.log('Running the function every 2 seconds');
//     try {
//         await getTheWebHookPayLoad(null, null); // Pass null as req and res since they are not used
//     } catch (error) {
//         console.error('Error occurred in cron job:', error);
//     }
// });