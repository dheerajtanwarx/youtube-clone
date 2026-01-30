import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";

const commentRouter = Router()

commentRouter.route('/addComment/v/:videoId').post(verifyJWT, addComment)
commentRouter.route('/updateComment/c/:commentId').post(verifyJWT, updateComment)
commentRouter.route('/deleteComment/c/:commentId').post(verifyJWT, deleteComment)
commentRouter.route('/getAllComments/:videoId').get( getAllComments)

export {commentRouter}