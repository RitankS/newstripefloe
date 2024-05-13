import express from "express"
import { getTheInteger , startStripeFlow ,openUrl ,  takePrice , createSession , sendEmail , monthlySubs , getTheWebHookPayLoad , testingPublicAPI, completeStripeFlow} from "../routes/routes.js"
const router = express.Router()


router.get("/integer" , getTheInteger)
router.post("/stripe" , startStripeFlow)
router.post("/getprice" , takePrice)
router.post("/session" , createSession)
router.post("/email" , sendEmail)
router.post("/subs" , monthlySubs)
router.post("/getpayload" , getTheWebHookPayLoad)
router.get("/test" , testingPublicAPI)
router.post("/open" , openUrl)
router.post("/startpay" , completeStripeFlow)


export default router