import mongoose from "mongoose";

const likeSchema = new Schema({
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    },
    likedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})