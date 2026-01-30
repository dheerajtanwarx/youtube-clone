import { compare } from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async(req, res)=>{
    const{ videoId } = req.params
    const {content} = req.body
    const userId = req.user._id
 
    if(!content){
        throw new ApiError(400, "Please enter a comment")
    }

    console.log('content:', content)


    const createdcomment = await Comment.create({
        content: content,
        video:videoId,
        owner:userId
    })
    console.log("Comment: ", createdcomment)

    return res.status(200).json(
        new ApiResponse(200, createdcomment, "Comment added successfuly")
    )

    
})

const updateComment = asyncHandler(async(req, res)=>{
    const { commentId } = req.params 
    const userId = req.user._id
    const {content} = req.body

const comment = await Comment.findById(commentId)
if(!comment){
    throw new ApiError(400, "comment not found")
}

    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(400, "You are not allowed to edit comment")
    }


    comment.content = content
    
    await comment.save()

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment is updated"))
})

const deleteComment = asyncHandler(async(req, res)=>{
    const {commentId} = req.params
    const userId = req.user._id

    const comment = await Comment.findById(commentId)

    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(400, "You are not elligible to delete the comment")
    }
    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json(
        new ApiResponse(200, "Comment deleted successfully")
    )
})

const getAllComments = asyncHandler(async(req, res)=>{
    const{page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId} = req.query
    const {videoId} = req.params
    const pageNumber = Number(page)
    const limitNumber = Number(limit)
    const skip = (pageNumber - 1)*limitNumber 

   const video = await Video.findById(videoId)
   if(!video){
    throw new ApiError(404, "Video not found")
   }

   const comments = await Comment.aggregate([
    { //wo sbb comment document lao jaha video me ye wali video id hai mtlb sirf iss video ke comment lao
        $match:{
            video: new mongoose.Types.ObjectId(video._id)
        }
    },
    {
       $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"ownerInfo"
       }
    },
    {
        $unwind:"$ownerInfo"
    },
    {
        $project:{
            content:1,
            createdAt:1,
            "ownerInfo.username":1,
            "ownerInfo.avatar":1,

        }
    },
    {
        $sort:{
            [sortBy]: sortType === "asc" ? 1 : -1
        }
    },
    {
        $skip: skip
    },
    {
        $limit: limitNumber
    }
   ])

   const totalComments = await Comment.countDocuments({
    video: videoId
   })

   return res.status(200).json(
    new ApiResponse(200, 
       { comments,
        page: pageNumber,
        limit:limitNumber,
        totalComments},
        "all comments fetched successfully")
   )


})

export {addComment, updateComment, deleteComment, getAllComments}