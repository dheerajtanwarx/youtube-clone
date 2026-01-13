//Utils (jaise ApiError, asyncHandler) ka use isliye hota hai
//taaki hume same code baar-baar na likhna pade

// for example withour asyncHandler hume try catch lgana pdta hai 
/*const registerUser = async(req, res, next)=>{
    try(
        const user = user.create(...)
    
        res.status(200).json({
        success: true,
        message :"user register successfuly"
        })

    )   catch(err){
       next(error)
    }

    }

 //with asyncHandler
 const registerUser = asyncHandler(async (req, res) => {

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({ ... })

  return res.status(201).json(
    new ApiResponse(200, user, "User registered Successfully")
  )
})

*/
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }



//higher order function mtlb ek function ko hi as a parameter pass kar diya
// const asyncHandler = (fn)=>async(req, res, next)=>
//   {
// try {
//     await fn(req, res, next)
    
// } catch (error) {
//     res.status(err.code || 500 ).json({
//   success: false,
//   message: err.message
// })
// }
// }

// export {asyncHandler}

