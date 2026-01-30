import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";

const likeRouter = Router()

likeRouter.route("/v/:videoId").post(verifyJWT, toggleVideoLike)
likeRouter.route("/c/:commentId").post(verifyJWT, toggleCommentLike)
likeRouter.route("/likedVideos/").get(verifyJWT, getLikedVideos)

export {likeRouter}