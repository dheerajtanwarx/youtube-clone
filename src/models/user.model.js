import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
username:{
    type:String,
    required:true,
    unique:true,
    lowecase:true,
    trim:true,
    index:true
},
email:{
    type:String,
    required:true,
    unique:true,
    lowecase:true,
    trim:true,
},
fullname:{
    type:String,
    required:true,
    trim:true,
    index:true
},
avatar:{
    type:String ,//cloudinary url
    required:true
},
coverimage:{
    type:String ,//cloudinary url
    
},
watchHistory:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Video"
}],

password:{
    type:String,
    required:[true, "Password is required"]
},

refreshToken:{
type:String
}

},{timestamps:true})


//ye ek hook hai mongoose ka jo hum isliye use krte hai ki hume mongodb me data ke save hone se just phle kuch code run krwana ho koi logic likha to wo hum is hook ka use krke likh skte hai
//or hum isme kbhi bhi arrow function as a call back pass ni krte sirf normal wala krte haih
//ye humesha async rhta h kyuki inko process hone me time lgta hai
//or ye ek middleware hai to next access to dena hi pdta hai or end me is next ko call krte hai
//save ka mtlb hai jab koi bhi chij save ho tb run ho jaye ga automatically
userSchema.pre("save", async function(next){ 

// agar password change hi nahi hua
  if (!this.isModified("password")) {       //yaha par savehar 
    return next()
}
	                                        //operation par chale ga jaise ki
                                            //•	new user create
	                                       //•	user update
	                                         //•	profile update (sirf name/email)
	                                        //•	etc.
                                               //Isliye password baar-baar hash ho raha hai.


    // sirf tab hash karo jab password change ho according to upper if condition 
this.password = await bcrypt.hash(this.password, 10) //ab humne is logic ke liye pre ka use kiya ki data save hone se phle just password ko protect krdo 
next() //ab next mtlb hum agle step pr ja skte hai lekin ek problem ho gyi jab bhi ye data save hoga hr baar password ko hash kre ga or store kre ga to password bar bar change hoga 
})

//ye methods hum khud bna rhe .methods ka use krke hum koi bhi method bana skte hai ab ye method isliye bnaya hai kyuki upr wale method se humne hashed password ko save kr liye lekin jab next time request aaye gi tb humare pass plane password bhi to rehna chahiye usko hash se compare krne ke liye
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}




//////////ab hum jwt ka concept smjhe ge/////////////
userSchema.methods.generateAccessToken = function(){
    //jwt.sign se hum jwt token generate krte hai usme hume ye 3 fields deni pdti hai jinse jwt bnta hai sabse phli ye payload jisme user ki details hoti hai phir dusra hota hai secret key or teesra hota hai uski expiry or syntax aisa hi rehta hai 
    return jwt.sign (

        {_id: this._id,
        email: this.email,
        userName: this.username,
        fullName: this.fullname},
        
        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}

export const User = model("User", userSchema)