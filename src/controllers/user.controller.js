import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

// ye function hai specific user ka accessToken or refreshToken generate krne ke liye
const generateAccessTokenAndRefreshToken = async(userId)=>{
   try {
// 	•	JWT agar long time ke liye valid ho:
// 	•	hack ho gaya → attacker ko long access 😬
// 	•	JWT agar short time ke liye valid ho:
// 	•	user ko baar-baar login karna pade 😤

// 👉 Dono case bekaar.
//isliye hum accesstoken or refresh token ka use krte hai access token ki life expiry choti hoti h or refresh token ki jyada to jab access token expire ho jata h tb refresh token ek new access token generate kr deta h
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
   const refreshToken =  user.generateRefreshToken()

   user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false})

   return {accessToken, refreshToken}
    
   } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
    // console.log("error msg", error)
   }
}

//ye hai user create krne ke liye
const registerUser = asyncHandler(async (req, res)=>{

   //get user details from frontend
   //validation -not empty
   //check if user already exists: username email
   //check for images, check for avatar
   //upload them to cloudinary, avatar
   //create user object - create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return yes

//aise hum user details lete hai
console.log("FILES:", req.files);

    const {fullname, username, email, password}=req.body
    console.log("data: ", req.body)

//ye validation krne ka ek new trika hai .some lga kr ki sbhi fields hai ya ni
    if(
        [fullname, email, username, password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

 //ye user already exist hai ya ni uske liye   
    const existedUser = await User.findOne({
        $or: [{username},{email}] //ye bhi ek naya tarika hai multiple fields ko check krne ka logical method ke sath ek array ke andar objects unke andr ek ek field
    })

    if(existedUser){
        throw new ApiError(409, "User with email or userbame allready exist")
    }



//ye images ke liye
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path  //isse error aaye ga agr hum coverimage ni bheje ge to 

    let coverImageLocalPath 
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

console.log("localPath",avatarLocalPath)

    let avatar
    let coverImage

    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    } catch (error) {
        throw new ApiError(500, "error : uploading images to cloudinary")
    }

    if (!avatar) {
  throw new ApiError(400, "Avatar upload failed")
}
    

// ye user create krne ke liye

   const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
console.log("Created user", user)
//ye password or refresh token remove krne ke liye
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

//ye hai user login krne ke liye
const loginUser = asyncHandler(async (req, res)=>{
   
    //req body -> data
    //username or email check exist or not
    //find the user
    //password check
    //access and refresh token
    //send cookie
    
    const {email, username, password} = req.body

// //agar ApiError utility na hoti to error aise bhejna pdta 
// if(!username || !email){
//     res.status(400).json({
//         success: false,
//         message: "username or email is required"
//     })
// }
      //ya toh email dedo ya username uske liye syntax ye wala use hota h ye ni (!email || !username)
    if(!(email || username)){
        throw new ApiError(400, "username or email is required")
    }
   
//ye $or wala concept hum multicheck ke liye use kr rhe hai ki ya to email find krdo ya username sirf ek chij hoti to user.findOne(email) krke kar lete 
    const user = await User.findOne({
        $or:[{username}, {email}]
        
    },console.log("email:",email))
    
    if(!user){
        // res.status(404).json({
        //     success:false,
        //     message:"user does not exist"
        // }) same work in different approach with Apierror utility

        throw new ApiError(404, "User does not exist")
    }

  //ye humne mongoose model me ek method define kiya tha isPasswordCorrect jisme humne current password pass kiya ab waha se check or validate hokr yaha pr response aa jaye ga  
     const isUserValid = await user.isPasswordCorrect(password)
     if(!isUserValid){
        throw new ApiError(409, "Invalid user credentials")
     }
  
//ye humne jo dono tokens return hokr aare the unko access kr liya iss method ko call krke or isme userid as a parameter bhi pass krdi
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    //ab humne yha wapis se ek db call ki hai user ko dubara laane ke liye kyuki ye ab ek updated user ho gya isse phle humare pas refresh token wali field khali thi lekin ab wo bhr chuki isliye isliye humne ek new db call lgai ab ye trika optional tha apn direct bhi update kr skte the bina user ko dubara call kiye or humne .select ka use krke password or refreshToken ko as a response me user ko ni bheja 
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


   const options = {
    httpOnly: true,
    secure: true
   }

//    Cookie me bhejna
// 👉 Ye browser ke paas jaata hai (JS ke paas nahi) jaise .cookie(accessToken) bhej rhe hai to iska mtlb hai ye isko browser internally handle kr rha hai na ki frontend js
console.log("✅Loggedin user:", loggedInUser)
console.log("AccessTOken,",req.cookies.accessToken)
console.log("RefreshTOken,",req.cookies.refreshToken)
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken //at or rt ko json me bhejna ek good practice ni hai ye risky ho skta hai js ko inka access mil skta hai or hack ho skta h program
        },
        "User logged in Successfuly"
    )
   )
   

   
})

//ye hai user ko logout krne ke liye
const logOutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
            
        },
        {
                new:true
        }
    )

    const options = {
    httpOnly: true,
    secure: true
   }

   return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged Out"))
})

//ye controller hum bna rhe hai ki jab frontend se request aaye new access token generate krne ki with the help of refresh token to hum ye logic ki help new access token generate krde 
const refreshAccessToken = asyncHandler(async(req, res)=>{

const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //ab hume access token ko gen. krne ke liye refresh token ki jrurt pde gi jo user frontend se bhej rha hai to usko access kr liya (Doubt: refreshToken user kse bheje ga)

if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized Request")
}

//ab humne refresh token ko verify kr liya ki token original hai ya koi duplicate to ni 
try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
    //Doubt decoded toke ke pass id kse aayi  or ky ye jo incoming refresh token hai wo user ka existing stored token h db me
    const user = await User.findById(decodedToken?._id)
    
    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }
    
    if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401, "Refresh Token is expired or used")
    }
    
    const options ={
        httpOnly : true,
        secure:true
    }
    
    const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    return res
    .status(200)
    .cookie("accesToken", accessToken, options)
    .cookie("refreshToken",newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
        )
    )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token ")
}
})

//ye function hai password change karne ke liye 
const changePassword =  asyncHandler(async(req, res)=>{
const {oldPassword, newPassword, confPassword} = req.body //Doubt humne ye variable to create kr liye lekin inki values ko inme hi kaise store krwaye ge uska logic to khi likha hi ni jse username lete h to uska schema humne bna rkha h lekin old or new kse?


if(!(newPassword === confPassword)){
 throw new ApiError(501, "Password is not same")
}

const user = await User.findById(req.user?._id) //ye user hum verifyJWT wale middleware ki wjh se access kr paa rhe hai 

const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)//ye old password hum as a parameter transfer kr rhe h isPasswordCorrect method ko jo ki humne user model me define kr rkha hai
if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid old Password")
}

user.password = newPassword 
await user.save({validateBeforeSave:false})

})


// ye function hai current user ko fetch krne ke liye
const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200).json(200, req.user, "Current user fetched successfully")
})


//ye hai account Details ko update krne ke liye
const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullname, email} = req.body

    if(!(fullname || email)){
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(req.user?._id,
     {
      $set:{
        fullname,
        email: email //jab same naam ho tb hum dono trike se likh skte hai 
      }
    },
    {new : true} //ye parameter hum updated or new value return krne ke liye likhte h
).select("-password")
return res
.status(200)
.json(new ApiResponse(200, user, "Account details updated successfully"))
})

//ye hai user ke avatar ko change karne ke liye
const updateUserAvatar = asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path /////ye hum multer middleware ki help se access kr paa rhe h Doubt:req.files or req.file me difference

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on Avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
             avatar : avatar.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200, "Avatar is updated successfully"))
})

//ye hai coverImage ko update krne ke liye
const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on Cover Image")
    }

   const user =  User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
              coverImage: coverImage.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json( new ApiResponse(200, "Cover image updated successfully"))
})


export {registerUser, loginUser, logOutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage}