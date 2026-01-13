import { Router } from "express";
// import registerUser from "../controllers/user.controller.js";
import { registerUser, loginUser, logOutUser, refreshAccessToken } 
from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route('/register').post(

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

router.route('/login').post(loginUser)


//secured routes (allowed only to the login users)
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refresh-token").post(refreshAccessToken) //ye endpoint hai refresh-token wapis gen. krne ke liya//doubt : yaha pr hume verify jwt ki jrurt kyu ni pdi 

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

export default router