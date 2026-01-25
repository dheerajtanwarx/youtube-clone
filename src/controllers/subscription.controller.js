import mongoose, { mongo } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    //TODO:toggle subscription
    if (!channelId?.trim()) {
        throw new ApiError(400, "channelId is missing")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel does not exist")
    }


    const subscription = await Subscription.aggregate([
        {//mongo db bolta hai jo document iss condition se match kre usko result me dal do 
            $match: {
                subscriber: new mongoose.Types.ObjectId(req.user._id),
                channel: new mongoose.Types.ObjectId(channelId)
            }

        },
        { $limit: 1 }
    ])

    if (subscription.length > 0) {
        await Subscription.findByIdAndDelete(subscription[0]._id) // ye _id document ki id hai 

        return res.status(200).json(
            new ApiResponse(200, { subscribed: false }, "unsubscribe sucssessful") //doubt :yaha pr subscribed kaha se aya ye variable humne kab declare kra 
        )
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })

    return res.status(200).json(
        new ApiResponse(200, { subscribed: true }, "subscribed successfully")
    )


})


//controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
   
const {channelId} = req.params

if(!channelId?.trim()){
    throw new ApiError(400, "channel Id is required")
}

const channel = await User.findById(channelId)
if(!channel){
    throw new ApiError(400, "Channel does not exist")
}

    const subscribers = await Subscription.aggregate([
        {
            $match: { ///iska mtlb hai sirf wo subs documents lao jaha channel me ye channel id match kr rhi ho yani ki searched user only 
             channel : new mongoose.Types.ObjectId(channelId)
            
            }
        },
      {//$lookup subscription ke subscriber ID ko
       // users ke _id se match karke
        // us user ka data result me jod deta hai.

            $lookup:{
                from:"users",
                foreignField:"_id", //iska mtlb h users model me jo _id hai yani ki user id usko subscription model ke subscriber me add krdo
                localField:"subscriber",
                as:"subscriberInfo"
            }
        },

        // 3️⃣ Array ko object me badlo
        {
            $unwind:"$subscriberInfo"
        },
        {
            $project:{
                _id: 0 ,//doubt: iska ky mtlb h
                subscriberId: "$subscriberInfo._id",
                username: "$subscriberInfo.username",
                avatar: "$subscriberInfo.avatar"
            }
        }
    ])
    console.log("subscribers:", subscribers.length)
    return res.status(200).json(
        new ApiResponse(200, {subscribers}, "subscriber fetched successfuly")
    )
})

const getSubscribedChannels = asyncHandler(async(req, res)=>{
    const userId = req.user._id

    if(!userId){
        throw new ApiError(400, "user is not authenticated")
    }

    try {
        const subscribedChannels = await Subscription.aggregate([
            {
                $match:{ //wo wale subscriber document dhundo jaha par userId me ye current user ho
                    subscriber: new mongoose.Types.ObjectId(userId)
                }
            },
            { // // 2️⃣ channel (user) ka data lao
                $lookup:{
                    from:"users",
                    foreignField:"_id",
                    localField:"channel",
                    as:"channelInfo"
                }
            },
            {$unwind:"$channelInfo"},
            {
                $project:{
                    _id:0,
                    subscribedChannel: "$channelInfo._id",
                    username:"$channelInfo.username",
                    avatar:"$channelInfo.avatar"
    
                }
            }
    
        ])
       console.log("Subscribed channels: ", subscribedChannels)
        return res
        .status(200)
        .json(
            new ApiResponse(200, {subscribedChannels}, "subscribed channel list fetched susseccfuly")
        )
    } catch (error) {
         console.log("error: ", error.message)
    }
})


export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }