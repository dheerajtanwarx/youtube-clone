import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const dashboardRouter = Router()

dashboardRouter.route('/getVideos/c/:channelId').get(getChannelVideos)
dashboardRouter.route('/getChannelStats').get(verifyJWT, getChannelStats)


export default dashboardRouter