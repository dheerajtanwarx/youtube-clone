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


// userRouter.route('/register').post(
//   (req, res, next) => {
//     console.log("➡️ /register route HIT");
//     next();
//   },
//   upload.fields([
//     { name: 'avatar', maxCount: 1 },
//     { name: 'coverImage', maxCount: 1 }
//   ]),
//   (req, res, next) => {
//     console.log("📦 multer files:", req.files);
//     next();
//   },
//   registerUser
// )

export default userRouter