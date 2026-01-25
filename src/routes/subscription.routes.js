import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router()
subscriptionRouter.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

//subscription controller routes
subscriptionRouter.route("/channel/:channelId/subscribers").get(verifyJWT, getUserChannelSubscribers)
subscriptionRouter.route("/channel/:channelId").post(verifyJWT, toggleSubscription)
subscriptionRouter.route("/subscribed-channels").get(verifyJWT, getSubscribedChannels)

export default subscriptionRouter