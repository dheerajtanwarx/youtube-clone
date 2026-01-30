import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"; 
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

    const toggleVideoLike = asyncHandler(async(req, res)=>{
        const {videoId} = req.params
        const userId = req.user._id

        if(!videoId?.trim()){
            throw new ApiError(400, "video id is missing")
        }
        
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(404, "Video is not exist")
        }

        const like = await Like.aggregate([
          {  $match:{
               likedBy: new mongoose.Types.ObjectId(userId),
               video: new mongoose.Types.ObjectId(video._id)
            }
          },
          {
            $limit:1
          }
        ])

        if(like.length>0){
            await Like.findByIdAndDelete(like[0]._id)

            return res.status(200).json(
                new ApiResponse(200, {isLiked: false}, "video unlike")
            )
        }

        await Like.create({
            video:video._id,
            likedBy:userId
        })

        return res.status(200).json(
            new ApiResponse(200, {isLiked: true}, "video liked")
        )
    })

    const toggleCommentLike = asyncHandler(async(req, res)=>{
        const{commentId} = req.params
        const userId = req.user._id

        if(!commentId?.trim()){
            throw new ApiError(404, "commentId is missing")
        }

       const comment =  await Comment.findById(commentId)

       if(!comment){
        throw new ApiError(403, "comment not found")
       }

       const like = await Like.aggregate([
        {
            $match:{
                comment: mongoose.Types.ObjectId,
                likedBy: mongoose.Types.ObjectId
            }
        },
        {$limit:1}
       ])

       if(like[0].length>0){
        await Like.findByIdAndDelete(like[0]._id)
        return res.status(200).json(
            new ApiResponse(200, {isLike:false}, "comment unliked")
        )
       }

       await Like.create({
        comment:comment._id,
        likedBy:userId
       })
       return res.status(200).json(
        new ApiResponse(200, {isLike: true}, "comment liked")
       )


    })

    const getLikedVideos = asyncHandler(async(req, res)=>{
        const {page =1, limit = 10, query, sortBy="createdAt", sortType="desc"} = req.query
        const userId = req.user._id
 
        const pageNumber = Number(page)
        const limitNumber = Number(limit)
        const skip = (pageNumber-1)*limitNumber

        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(404, "user not found")
        }

        const likedVideos = await Like.aggregate([
            {
                $match:{
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"video",
                    foreignField:"_id",
                    as:"videoInfo"
               }
        },
        {$unwind: "$videoInfo"},
        {
            $project:{
                  _id: "$videoInfo._id",
                title: "$videoInfo.title",
                thumbnail: "$videoInfo.thumbnail",
                duration: "$videoInfo.duration",
                views: "$videoInfo.views",
                createdAt: "$videoInfo.createdAt"
            }
        },
        {$skip:skip},
        {$sort:{
         [sortBy]: sortType === "asc" ? 1 : -1
        }},
        {$limit: limitNumber}
        ])

        const totalVideo = await Like.countDocuments(
            {                            
                likedBy: userId,              //	•	likedBy: userId → sirf current user     
                video: { $exists: true }
                //•	video: { $exists: true } → sirf video likes (comment likes exclude)
             }
        )

        return res.status(200).json(
            new ApiResponse(200, likedVideos, totalVideo, "liked videos fetched successfuly")
        )
    })

    export{toggleVideoLike, toggleCommentLike, getLikedVideos}