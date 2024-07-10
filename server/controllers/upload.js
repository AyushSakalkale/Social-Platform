import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (filepath) => {
  try {
    // console.log("Cloudinary Configuration:");
    // console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
    // console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
    // console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);

    const uploadedResponse = await cloudinary.uploader.upload(filepath);
    //console.log("Upload successful:", uploadedResponse);
    return uploadedResponse;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw error; // Re-throw the error for further handling
  }
};

export default uploadFile;
