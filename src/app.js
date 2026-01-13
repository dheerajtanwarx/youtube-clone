import express, { json } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config();

const app = express()

//app.use humesha middleware wgra define karne ke liye hi use hota hai

//ye practice hai cors ke liye frontend or backend shi se baat kr ske cors origin abhi ke liye * hai mtlb kahi se bhi request aa skti hai
app.use(cors({ 
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//ye practice hai json data accept krne ki jab hum frontend se data bhejte hai tb humare pass bhout trike ke data aate hai toh unn data ko backend ko accept krane ke liye  aise middleware ka use krna pdta hai jaise yaha hum json ka data accept kr rhe hai or limit de rhe hai ki sirf itna json data hi mai accept kr skta hu
app.use(express.json({limit:"16kb"}))

//jab hum kabhi url se data lenge to usme alg alg specials characters aate hai to unko express smjh ni pata isliye url encoded middleware ka use krta hai , extended true jyada use ni hota  
app.use(express.urlencoded({extended:true, limit:"16kb"}))

//iska use hum public asstes ko store krne ke liye krte hai jaise koi bhi file pdf photo logo jo public ke liye use ho uske liye hum static use krte hai 
app.use(express.static("public"))
//Browser se aane wali cookies ko read / useable banata hai Matlab:
	//•	User ke browser me jo cookies hoti hain
	//•	Wo request ke saath server pe aati hain
	//•	cookie-parser unko req.cookies me convert kar deta hai
app.use(cookieParser())


// import routes
import router from './routes/user.routes.js';
// import userRouter from './routes/user.routes.js';



//declare routes
app.use('/api/v1/user', router)

app.use((req, res, next) => {
  console.log("🌍 REQUEST:", req.method, req.url);
  next();
});



export {app}