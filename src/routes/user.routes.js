import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const userRouter = Router()

userRouter.route('/register').post(
    upload.fields([             //ye hai images ko bhejne ke liye
        {  
            name:'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),
        registerUser
)

export default userRouter