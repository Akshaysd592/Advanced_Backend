import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser= asyncHandler(async (req,res)=>{
 
     // get user details from frontend according to model
     // validation of the details 
     // check user exist already : username, email
     // get avatar and images , check for avatar
     // upload them to cloudinary , local store will be done by middleware multer when api router working 
     // avatar check on cloudinary
     // create user object - create entry in db
     // remove password and refreshtoken field from response
     // check for user creation
     // return res

     const {username,email,fullName,password} =  req.body; // get data
    //  console.log("email",email);

    // validation can alos be
    //  if(fullName === ""){
    //     throw  new ApiError(400,"fullName is required");
    //  }

     
 // validation
    if( // here can also use .map but .some will directly return true or false
        [fullName,email,username,password].some((field)=>
            field?.trim() === "" )
    ){
         throw new ApiError(400,"All fields are required");
         // create new error using ApiError 
    }


    // check user already exist
   const existedUser=  await  User.findOne( // checking for both username and email 
      {
        $or: [{ email },{ username }]
      }
    )
    
    if(existedUser){
        throw new ApiError(409,"User with email or usename already exists")
    }

    // middleware multer will add some additional funtionality to this req.body
      // Get images and avatar to store on cloudinary
       // multer will add access to req.files similar to that of req.body



        const avatarLocalPath = req.files?.avatar[0]?.path // if files available then work , avatar was already declared in middleware in route 
                                   // 0th indexed object's path taking
        // const coverImageLocalPath = req.files?.coverImage[0]?.path

        // because coverImageLocalPath is not checked so before storing data check 
        let coverImageLocalPath; 
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
            // if req.files available and coverImage in it is an array and array length is greater than 0  then
        coverImageLocalPath = req.files.coverImage[0].path; // coverImage is an array 

        }

        



        // avatar is compulsory so check avatar
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required");
        }
 
         // upload to cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath); // if  coverImageLocalPath is empty then cloudinary  return null  not error 
        
        if(!avatar){ // check if avatar is stored properly
            throw new ApiError(400,"Avatar file is required ")
        }


        // Database entry

      const user = await  User.create({
            fullName,
            avatar : avatar.url,
            coverImage: coverImage?.url || "",  // because coverImage was not checked properly stored on cloudinary or not 
                                               // if coverImage is stored then use it's url else store ""
            username : username.toLowerCase(),
            email,
            password
        })


        // check user properly stored in db else just returned empty
      const createdUser = await  User.findById(user._id).select(
        "-password -refreshToken" // this select will exclude password and refreshToken fields 
                                  // to be stored in createdUser  minus sign and space seperated
      )

      if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
      }

        
       return res.status(201).json(
           new  ApiResponse(200,createdUser,"User Registered Successfully")
       )

})



export {registerUser}