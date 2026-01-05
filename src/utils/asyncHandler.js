//Utils (jaise ApiError, asyncHandler) ka use isliye hota hai
//taaki hume same code baar-baar na likhna pade


//higher order function mtlb ek function ko hi as a parameter pass kar diya
const asyncHandler = (fn)=>async(req, res, next)=>{
try {
    await fn(req, res, next)
    
} catch (error) {
    res.status(error.code || 500).json({
  success: false,
  message: error.message
})
}
}

export {asyncHandler}