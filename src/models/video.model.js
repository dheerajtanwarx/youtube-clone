import mongoose, { model, Schema } from "mongoose";

const videoSchema = new Schema({
    videoFile:{
        type:String ,//cloudinary url
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number, //duration nikle ga cloudinary se
        required:true
    },
    views:{
        type:Number, //duration nikle ga cloudinary se
        default:0
    },
    isPublished:{
        type:Boolean, //duration nikle ga cloudinary se
        default:true
    },
    videoOwner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate) 
export const Video = model("Video", videoSchema)