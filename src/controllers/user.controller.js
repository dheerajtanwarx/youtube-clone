import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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

export default registerUser