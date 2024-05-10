import express from "express";
import cors from "cors";
import stripe from "./router/router.js";
import bodyparser from 'body-parser';
import ngrok from "ngrok";


const app = express();
const port = 2001;


app.use(cors());
app.use(express.json());
app.use(bodyparser.json());
app.use("/pay", stripe);


app.listen(port, () => {
    console.log("App is listening fine");
});