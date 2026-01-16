//ye humne isliye bnaya h ki jab hum channel profile page create kre ge to hume waha pr ye dikhana pde ga ki kitne subscriber hai or agr humne kisi ke channel ko subscribe kr rkha h to waha pr subscribed dikhana

import mongoose, { model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
subscriber:{
type: Schema.Types.ObjectId, //jo channle ko subscribe kr rha h
ref:"User"
},
channel:{
type: Schema.Types.ObjectId,// jiske channel ko subscribe kar rha h
ref:"User"
}

},{timestamps:true})

export const Subscription =  mongoose.model("Subscription", subscriptionSchema)