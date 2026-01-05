import mongoose from "mongoose";


import dotenv from 'dotenv';  //-|  >dotenv aise
dotenv.config();             // -|  >    hi import karna padta hai    

import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
     try {
        //apn iss connection ko variable ke andr bhi store kr skte hai iska use console log me smjh aaye ga
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       
       console.log(`\n ✅ MONGODB is connected !! DB host: ${connectionInstance.connection.host}`) //ab ye reference dene ke liye humne connectioninstance ka use kiya ki hum kaha pr connect hue hai kaha par ni ye ek good practice hai 
     } catch (error) {
        console.log("MONGODB connection error", error)
        console.log("URI =", process.env.MONGODB_URI);
        process.exit(1)
     }
}

export default connectDB