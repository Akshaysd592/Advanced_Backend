import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

export const verifyJWT  = asyncHandler(async(req,res,next)=>{ // next because middleware
                                            // res is not in use 
                                            //so it can be written as 
                                            // (req,_,next) according to industry standard
       try {
         const token =  req.cookies?.accessToken // for mobile application nothing like cookies 
             || req.header("Authorization")?.replace("Bearer ","")
 
 
         if(!token){
             throw new ApiError(401,"Unauthorized request")
         }
 
         const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
         // payload and other data stored in decodeToken of accesstoken 
 
         const user= await User.findById(decodeToken._id).select("-password -refreshToken")
 
         if(!user){
 
             throw new ApiError(401,"Invalid Access Token");
         }
 
         // adding userdefined user or anything in request with value of user in it 
         req.user = user ; // now it can be accessed in controllers also 
 
         next();



       } catch (error) {
           throw new ApiError(401, error?.message ||
            "Invalid Access Token ")
       }


})

