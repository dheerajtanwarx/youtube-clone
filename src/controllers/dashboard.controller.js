import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";


const getChannelStats = asyncHandler(async(req, res)=>{
     // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
      
      const userId = req.user._id

      const videoStats = await Video.aggregate([
        {//sirf whi videos select kro jiska videos owner ye current user h

                         
            $match:{
                videoOwner: new mongoose.Types.ObjectId(userId)
            }
        },
        {//doubts: ye $group kyu use krte h
            $group:{
                _id:null,
                totalVideos: {$sum:1},
                totalViews: {$sum: "$views"}
            }
        }
      ])
 //inka ky mtlb hai
      const totalVideos = videoStats[0]?.totalVideos || 0
      const totalViews = videoStats[0]?.totalViews || 0 
//ye syntax kse h 
      const likeStats = await mongoose.model("Like").aggregate([
          {
              $match: {
                  video: { $exists: true }
              }
          },
          {
              $lookup: {
                  from: "videos",
                  localField: "video",
                  foreignField: "_id",
                  as: "videoInfo"
              }
          },
          { $unwind: "$videoInfo" },
          {
              $match: {
                  "videoInfo.videoOwner": new mongoose.Types.ObjectId(userId)
              }
          },
          {
              $count: "totalLikes"
          }
      ])

      const totalLikes = likeStats[0]?.totalLikes || 0

      const totalSubscribers = await mongoose.model("Subscription").countDocuments({
        channel: userId
      })

      return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalLikes,
                totalSubscribers
            },
            "channel stats fetched successfully"
        )
      )
})

const getChannelVideos = asyncHandler(async(req, res)=>{
    // TODO: Get all the videos uploaded by the channel

    const {channelId}= req.params

    if(!channelId?.trim()){
      throw new ApiError(404, "userId is missing")
    }

    const user = await User.findById(channelId)

    const channelVideos = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"videoOwner",
                as:"videoInfo"
            }
        },
        {$unwind: "$videoInfo"},
        {
            $project:{
                  _id: "$videoInfo._id",
                title: "$videoInfo.title",
                videoFile: "$videoInfo.videoFile",
                thumbnail: "$videoInfo.thumbnail",
                duration: "$videoInfo.duration",
                views: "$videoInfo.views",
                createdAt: "$videoInfo.createdAt"
            }
        }

    ])

    return res.status(200).json(
        new ApiResponse(200, channelVideos, "Channel videos fetched successfuly")
    )


})

export{getChannelVideos, getChannelStats}