import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/user.model.js";


const createPlaylist = asyncHandler(async(req, res)=>{
    const {name , description, videos} = req.body
    const userId = req.user._id
    // const {videoId} = req.params
    

    if(!(name && description && videos)){
        throw new ApiError(404, "Name  Desctiption and video is required")
    }
    // if(!videoId.trim()){
    //     throw new ApiError(404, "video id is missing")
    // }
    // const video = await Video.findById(videoId)

    // if(!video){
    //     throw new ApiError(404, "Video not found")
    // }

    const videoPlaylist = await Playlist.aggregate([
        {// iska mtlb h wo wali playlist lao jaha pr videos me to ye wali video ho or owner me ye wala owner ho agr ye dono uss playlist me hai to match ho jaye ge or iski length 0 se jyda hogi or hum error denge ki ruko playlist me ye video of this user allready hai or agr ni h to create krdo  ,,, hum yaha aggregation sirf already exist ke liye use kr rhe h
            $match:{
                owner: new mongoose.Types.ObjectId(userId),
                videos: {
  $in: videos.map(videoId => new mongoose.Types.ObjectId(videoId))
}
            }
        }
    ])

    if(videoPlaylist.length>0){
        throw new ApiError(400, "Video is already exists in a playlist")
    }


    const playlist = await Playlist.create({
        name,
        description,
        owner: userId,
        videos: videos.map(id => new mongoose.Types.ObjectId(id)) //String IDs → ObjectId ban jaati hain
    })

    return res.status(200).json({
        success: true,
        data : playlist,
        message: "Playlist created successfully"
    })
})

const getPlaylistBYId = asyncHandler(async(req, res)=>{

    const {playlistId} = req.params
    if(!playlistId.trim()){
        throw new ApiError(404, "playlist id is missing")
    }
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    const playlistDoc = await Playlist.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlist._id)
            }
        },

        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videoInfo"
            }
        },
        {
          $unwind : "$videoInfo"
        },
        {
            $project:{
                   name:1,
                   description:1,
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
    console.log("doucment:",playlistDoc)

    return res.status(200).json(
        new ApiResponse(200, playlistDoc, "Playlist fetched successfuly")
    )
})     

const addVideoToPlaylist = asyncHandler(async(req, res)=>{
  try {
      const {playlistId} = req.params
      const {videos} = req.body
      const userId = req.user._id
      if(!playlistId?.trim()){
          throw new ApiError(404, "playlist id is missing")
      }

      const playlist = await Playlist.findById(playlistId)
      if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(400, "You are not allowed to modify this playlist")
      }
    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }
    //iss wale logic me ye problem thi ek toh line of code itne jyada the or database operation jyda call ho rhe the or agr duplicate video aa jati to wo usko skip krne ki jgh pure request ko stop kr deta tha jaise upr create playlist me hota h 
    //   const videoPlaylist = await Playlist.aggregate([
    //       {
    //           $match:{
    //               _id: new mongoose.Types.ObjectId(playlistId),
    //               owner: new mongoose.Types.ObjectId(userId),
    //               videos:{
    //                   $in: videos.map(videoId => new mongoose.Types.ObjectId(videoId))
    //               }
    //           }
    //       }
    //   ])
    //   if(videoPlaylist.length>0){
    //       throw new ApiError(400, "Video is allready exist")
    //   }

    //    const newVideoIds = videos.map(videoId => new mongoose.Types.ObjectId(videoId))
    //    playlist.videos.push(...newVideoIds)

    //    await playlist.save()

    const incomingIds = videos.map(videoId=> new mongoose.Types.ObjectId(videoId))

         const playlistDoc =  await Playlist.findByIdAndUpdate(
           playlistId,
           { //addToSet ka use hota h jb hume array me video add karo lekin duplicate ho to add mat karo usko skip krdo or baki kii add krdo 
               $addToSet: {
                   videos: { $each: incomingIds } //$each har element ko individually  store krta hai nested array ni form hota for ex: without each [V1, [V2, V3]] and with each [V1, V2, V3]
                //videos : incomingIds
               }
           },
           { new: true }
       )

  
       console.log("Playlist", playlistDoc)
  
       return res.status(200).json(
          new ApiResponse(200, videos, "video added successfully ")
       )
  } catch (error) {
    console.log("error:",error)
  }
})

const removeVideoFromPlaylist = asyncHandler(async(req, res)=>{
    const { playlistId, videoId} = req.params
    const userId = req.user._id
    
    if(!(playlistId.trim() && videoId.trim())){
        throw new ApiError(404, "playlist id or video id is missing")
    }
    const playlist = await Playlist.findById(playlistId)
    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(400, "You are not allowed to modify this playlist")
      }
    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    await Playlist.findByIdAndUpdate(
        playlistId,
        { //pull hum kisi bhi array se value ko remove krne ke liye use krte hai agr yaha findbyidAnddelete ka use krte toh wo pure document ko delete kr deta means puri playlist ko delete kr deta 
            $pull:{
                videos : new mongoose.Types.ObjectId(videoId)
            }
        }
    )

    return res.status(200).json(
        new ApiResponse(200, "Video remove successfully")
    )
})

const deletePlaylist = asyncHandler(async(req, res)=>{
    const {playlistId} = req.params
    const userId = req.user._id

    if(!playlistId.trim()){
        throw new ApiError(400, "playlist id is missing")
    }

    const playlist = await Playlist.findById(playlistId)

    if(playlist.owner.toString() !== userId.toString())
{
    throw new ApiError(400,"You are not allowed to delete the playlist")
}
    await Playlist.findByIdAndDelete(playlist._id)

    return res.status(200).json(
        new ApiResponse(200, "Playlist is deleted successfully")
    )
})

const getUserPlaylists = asyncHandler(async(req, res)=>{
    const {userId} = req.params
    if(!userId.trim()){
        throw new ApiError(404, "userid is missing")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404, "User not found")
    }
    const userPlaylist =  await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $group:{
                _id:"$name",
                // totalPlaylist:{$sum:1},
                totalVideos:{$sum:{$size:"$videos"}},
                playlistDoc:{$push:"$$ROOT"}
            }
        }
    ])

   const totalPlaylist = await Playlist.countDocuments({
       owner: new mongoose.Types.ObjectId(user._id)
   })
    return res.status(200).json(
        new ApiResponse(200, totalPlaylist, userPlaylist, "User playlist fetch successfuly")
    )
})

const updatePlaylist = asyncHandler(async(req, res)=>{
    const {name, description} = req.body
    const {playlistId} = req.params

    const userId = req.user._id

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist is not found ")
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(400, "You are not allow to modify the playlist")
    }
    if(name == "" ){
        throw new ApiError(400, "name can not be empty")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist,
       { name : name,
        description: description}
    )
    await updatedPlaylist.save()
  
    return res.status(200).json(
         new ApiResponse(200, updatedPlaylist, "playlist is updated")
    )

}) 
export{createPlaylist, getPlaylistBYId, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, getUserPlaylists, updatePlaylist}