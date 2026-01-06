import { v2 as cloudinary } from 'cloudinary'

import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:UzfUwADVI-YLNPWYcDzSl7HM1Ug

})


// ye function hum isliye bna kyuki hum file ko files se utha kr phle to apne server me store kre phir jab wo waha server par aa jaye uske baad usko cloudinary pr upload kr de wse to hum direct niche jo v2 uploader wala link usse bhi direct cloudinary pr upload kr skte the lekin phle khud ke server pr store karna ek best practice hai.
const uploadOnCloudinary = async(localFilePath) => {
  try {
    if(!localFilePath) return null;  //agar localfile path ho hi na to null 

    //upload file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,{ //resource type ka mtlb hai format of the file like video audio png etc via auto it can autmatically detect
      resource_type: "auto"
    })

    //file has been successfully uploaded
    console.log("file is uplaod on cloudinary", response.url);
    return response; //ye user ko return krne ke liye ki file ky upload hui hai or uska meta data

  } catch (error) {
    fs.unlink(localFilePath) //remove the locally saved file from the server as the upload operation got failed
    return null
  }
}

//ye ek example hai ki aise uploader me link jata hai or wo store ho jata h

// cloudinary.v2.uploader
// .upload("dog.mp4", {
//   resource_type: "video", 
//   public_id: "my_dog",
//   overwrite: true, 
//   notification_url: "https://mysite.example.com/notify_endpoint"})
// .then(result=>console.log(result));

export {uploadOnCloudinary}