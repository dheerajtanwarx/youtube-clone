import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyJWTOptional } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos,  getVideoById,  togglePublish,  updateVideo,  uploadVideo } from "../controllers/video.controller.js";

const videoRouter = Router()

videoRouter.route('/upload-video').post(
    verifyJWT,
    // upload.single("videoFile"),
      upload.fields([             //ye hai images ko bhejne ke liye
        {  
            name:'videoFile',
            maxCount:1
            
        },
        {
            name:'thumbnail',
            maxCount:1
        }
    ]),
    uploadVideo
)
videoRouter.route('/upload-video').post(verifyJWT, uploadVideo)
videoRouter.route('/publish/v/:videoId').post(verifyJWT, togglePublish)
videoRouter.route('/getAllvideos').get(getAllVideos)
videoRouter.route('/v/:videoId').get(verifyJWTOptional, getVideoById)
videoRouter.route('/update-video/:videoId').post(verifyJWT, updateVideo)
videoRouter.route('/delete-video/:videoId').post(verifyJWT, deleteVideo)


export {videoRouter}