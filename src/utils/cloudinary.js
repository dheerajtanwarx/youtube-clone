//niche likhe comments ko smjhne ke liye multer middleware me likhe logic ko smjho
import { v2 as cloudinary } from 'cloudinary'

import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET

})


// ye function hum isliye bna kyuki hum file ko files se utha kr phle to apne server me store kre phir jab wo waha server par aa jaye uske baad usko cloudinary pr upload kr de wse to hum direct niche jo v2 uploader wala link usse bhi direct cloudinary pr upload kr skte the lekin phle khud ke server pr store karna ek best practice hai.

  const uploadOnCloudinary = async(localFilePath) => {
       try {
       if(!localFilePath){
         console.log("File not found for upload on cloudinary")
         return null;
       }


       console.log("Local file path:", localFilePath)
        
      const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
      })
   
      fs.unlinkSync(localFilePath)

      console.log("File is uploaded on cloudinary", response.secure_url)

      return response
       } catch (error) {
        
console.log("Cloudinary upload error:", error.message)
fs.unlinkSync(localFilePath)
    return null

       }

  }
export {uploadOnCloudinary}


// 1️⃣ Frontend

// User image/video select karta hai

// 2️⃣ Multer (tumhara middleware)

// upload.single("avatar")

// 	•	file ko ./public/null me store karta hai
// 	•	file ka naam originalname rakhta hai
// 	•	req.file.path bana deta hai

// 3️⃣ Cloudinary function

//uploadOnCloudinary(req.file.path)

	// •	server se file uthata hai
	// •	Cloudinary pe upload karta hai
	// •	upload ke baad server wali file delete ho jati hai

  