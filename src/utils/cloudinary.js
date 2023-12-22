import { v2 as cloudinary } from "cloudinary";
import fs from 'fs' // file system inbuild

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; // no localfilePath

    // else
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // file uploaded successfully
    console.log("File is uploaded on cloudinary successfully ", response.url);
    return response;

  } catch (error) {
    // not stored on fs then still remove the file 
    fs.unlinkSync(localFilePath); // remove locally stored temporary file as the upload is failed
    return null
        
       
  }
};


export {uploadOnCloudinary}