import { Router } from "express";
// import registerUser from "../controllers/user.controller.js";
import { registerUser, loginUser, logOutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } 
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
 router.route("/change-password").post(verifyJWT, changePassword)
 router.route("/current-user").get(verifyJWT, getCurrentUser)
 router.route("/update-account").patch(verifyJWT, updateAccountDetails)

//Doubt: inn dono me thoda doubt hai ki upr fields kyu use kiya or yaha sirf single kyu use kr rhe h ye multer ka logic h or ye single ke andr apn string me naam konsa dete h
 router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

//isme bhi doubt h ki ye username me ky actual username store hoga url me ya sirf ye constant name hi rhe ga
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)






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