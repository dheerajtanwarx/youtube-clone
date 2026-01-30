import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

const getAllVideos = asyncHandler(async(req, res)=>{
    const {page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId} = req.query;
    //Todo: get all videos based on query sort pagination

    //pagination values \\,,,,,, ye values url se jab apn uthate h to string me aati hai isliye usko number me convert krte h 
    const pageNumber = Number(page)
    const limitNumber = Number(limit)
    const skip = (pageNumber - 1) * limitNumber  //if pg no.=3 sol: skip = (3 - 1)*10 = 20 mtlb 3rd page me 20 videos skip krke next 10 videos show kro

    //match condition dynamically build kro
    const matchStage = {}
 
    //agar search query aayi h
    if(query){
        matchStage.$or = [
            {title: { $regex:query, $options: "i" }},
            {description:{ $regex: query, $options: "i"}}
        ];
    }

    //agr kisi specific user  ki videos chahiye
    if(userId){
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    // sort Stage
    const sortStage = {//ye sortBy can be as view, or createAt, likes
        [sortBy]: sortType === "asc" ? 1 : -1 	//•	1  = ascending
	                                           // •	-1 = descending

    };

    //Aggregation pipeline
   const videos = await Video.aggregate([
    {
      $match: matchStage 
    },
    {
        $sort:sortStage
    },
    {
        $skip: skip
    },
    {
        $limit: limitNumber
    },

    {
        $lookup:{
            from:"users",
            localField:"videoOwner",
            foreignField:"_id",
            as:"ownerInfo"
        }
    },
    {
        $unwind:"$ownerInfo"
    },
    {
        $project:{
            _id:1,
            title:1,
            description:1,
            views:1,
            thumbnail:1,
            createdAt:1,
           " ownerInfo._id":1,
           "ownerInfo.username":1,
           "ownerInfo.avatar":1

        }
    }
    
])

//Total count pagination ke liye
const totalVideos = await Video.countDocuments(matchStage)

return res.status(200).json(
    new ApiResponse(
        200,
        {
            videos,
            page: pageNumber,
            limit: limitNumber,
            totalVideos
        },
        "Videos fetched successfully"
    )
)


})


const uploadVideo = asyncHandler(async(req, res)=>{
    const{ description, title} = req.body
    
    console.log("requested files", req.files)



    // TODO: get video, upload to cloudinary, create video
    let videoLocalPath
    let thumbnailLocalPath
    // if(req.files && Array.isArray(req.files.videoFile)&& req.files.videoFile.length>0){
    //     videoLocalPath = req.files.videoFile[0].path
    // }
    //if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        // videoLocalPath = req.files.videoFile[0].path
   // }

   videoLocalPath = req.files?.videoFile[0]?.path
   thumbnailLocalPath = req.files?.thumbnail[0]?.path
    console.log("video local path:",videoLocalPath)
    console.log("thumbnail local path:",thumbnailLocalPath)
    let videoFile
    let thumbnail
    try {
        videoFile = await uploadOnCloudinary(videoLocalPath)
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    } catch (error) {
        throw new ApiError(500, "error while uploading video on cloudinary")
    }

    
    //duration hum cloudinary ke duration property se nikal skte h ye seconds me aata h'
    const videoDuration = videoFile?.duration
    
    const user = req.user._id

// ye aggregation hai user ki details lene ke liye lekin hume puri details ni chahiye req.user se hum sirf id le skte h or videowner me sirf id hi de skte hai kyuki type object id h to ye aggregation bs check krne ke liye use kiya ki work kse hota h
//     const userDetails = await Video.aggregate([
//         {
//             $match:{
//                 videoOwner: new mongoose.Types.ObjectId(req.user._id)
//             }
//         },
//         {
//             $lookup:{
//                 from:"users",
//                 foreignField:"_id",
//                 localField:"videoOwner",
//                 as:"userInfo"
//             }
//         },
//         {$unwind: "$userInfo"}
//     ])
// console.log("userDetails: ", userDetails)
    
//     console.log("user:", user)
     
    const video = await Video.create({
        description,
        title,
        videoFile : videoFile?.url,
        thumbnail: thumbnail?.url,
        duration: videoDuration,
        videoOwner:user
    })
    console.log("uploaded Video", video)
    return res.status(200).json(
        new ApiResponse(200, {video}, "Video upload successfully")
    )



})


const togglePublish = asyncHandler(async(req, res)=>{
    const {videoId }= req.params
    const userId = req.user._id

    const video = await Video.findById(videoId)
    
    if(!video){
    throw new ApiError(404, "video not found")
    }

    if(video.videoOwner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not allowed to publish the Video")
    }
    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).json(
        new ApiResponse(200, {isPublished: video.isPublished}, "Video publish status updated")
    )
})

const getVideoById= asyncHandler(async(req, res)=>{
    const {videoId} =  req.params
     const userId = req.user._id
    const video = await Video.findById(videoId)

    console.log("Video Doc:", video)
    if(!video){
        throw new ApiError(404, "video not found ")
    }

    if(video.isPublished !== true){
        if(!userId || video.videoOwner.toString() !== userId.toString()){
            throw new ApiError(403, "This video is not published")
        }
    }

    video.views += 1;
    await video.save()
    console.log("Views: ", video.views)

    return res.status(200).json(
        new ApiResponse(200, {video}, "video fetched successfuly")
    )

})

const updateVideo = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    const userId = req.user._id
    const{description, title} = req.body
   
if(!(description && title)){
    throw new ApiError(400, "All field are required")
}

    const video = await Video.findById(videoId)
      

    if(!video){
        throw new ApiError(404, "Video is not found")
    }
    if(video.videoOwner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not elligible for edit this video")
    }

    if(description){
        video.description = description
    }
    if(title){
        video.title = title
    }

    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "video updated successfully")
    )

})

const deleteVideo = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    const userId = req.user?._id

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found")
    }

    if(video.videoOwner.toString() !== userId.toString()){
        throw new ApiError(403, "You are not allowed to delete the video")
    }

   await Video.findByIdAndDelete(videoId)

   return res.status(200).json(
    new ApiResponse(200, "Video deleted successfully")
   )
})

export{getAllVideos, uploadVideo, togglePublish, getVideoById, updateVideo, deleteVideo}

