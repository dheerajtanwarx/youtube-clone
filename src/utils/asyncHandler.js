//Utils (jaise ApiError, asyncHandler) ka use isliye hota hai
//taaki hume same code baar-baar na likhna pade

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