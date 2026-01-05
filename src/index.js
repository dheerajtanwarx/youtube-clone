import dotenv from 'dotenv';  //-|  >dotenv aise
dotenv.config();             // -|  >    hi import karna padta hai    

import connectDB from './db/index.js';
import { app } from './app.js';

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
     console.log(`App is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connnection failed",err)
})

