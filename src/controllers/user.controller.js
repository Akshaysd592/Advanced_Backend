import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'

// since this function of token generation will required to be implemented
// again and again so directly creating a function 
const generateAccessAndRefreshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const  refreshToken = user.generateRefreshToken();

       user.refreshToken = refreshToken;
      await  user.save({validateBeforeSave:false}); // mongodb try to validate all fields so no need to validate when storing this token value 
      
      return {accessToken,refreshToken};

  } catch (error) {
     throw new ApiError(500,"Something went wrong while generating access and refresh token ")
  }
}

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


const loginUser = asyncHandler(async (req,res)=>{
  // Todo's 
  // req body ->data
  // username and password
  // find user
  // password check 
  // access and refresh token
  // send cookies
  // return response


  const {username, email, password} = req.body;

   if(!username &&  !email){
        throw new ApiError(400,"username or email is required")
   }
  

   // if both are required
   if(!(username || email)){
    throw new ApiError(400,"Both email and username is required");
   }

    const user =   await User.findOne({ // now this user also have function like isPasswordCorrect() in  which is declared with model declaration
    $or:[{email},{username}]
  })

  if(!user){
    throw new ApiError(404,"User does not exists")
  }
  
   // user which is obtained from db will also have functions declared in models 
   const isPasswordValid =  await user.isPasswordCorrect(password);

    if(!isPasswordValid){
      throw new ApiError(401,"Invalid user credentials ");
    }

    const {accessToken,refreshToken} =    await generateAccessAndRefreshTokens(user._id); // acccessToken and refreshToken generate
     //this refreshToken generated is stored in database but not in this user

  // remove password and refreshToken 
    const loggedInUser = await  User.findById(user._id).select(
      "-password -refreshToken"
    )
   
    // cookies generation
    const options ={
      httpOnly :true,
      secure:true
    }

     // passed jwt accessToken and refreshToken as a values 
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)  // accessToken cookie
    .cookie("refreshToken",refreshToken,options) // refreshToken cookie
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken,
          refreshToken
        },
        "User loggedIn Successfully"

      )
    )
})


const logoutUser = asyncHandler (async(req,res)=>{
  // before loggedout user check whether the user loggedIn or not
  // whether the cookie and jwt accessToken and refreshToken generated or not 
  //That's why we are puting middleware auth to authenticate 
  // if auth include user loggedin then you can access it using req.user or req.userdefinedname which is set inside the auth.midddleware.js

  // const user = req.user._id;
  //  to logout user remove  refreshtoken and cookies


   await User.findByIdAndUpdate(
    // for token
       req.user._id,
       {
         $set:{
          refreshToken: undefined
         }
       },
       {
         new :true
       }
   )

   // for cookies

   const options = {
    httpOnly:true,
    secure:true
   }

   res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(
    new ApiResponse(200,{},"User logged out ")
   )

   





})


// accessToken get expired so need to refreshToken so that session should not end 
// so creating refreshAccessToken controller
const refreshAccessToken = asyncHandler(async(req,res)=>{
     try {
         // since accessToken expired 
       const incomingRefreshToken = req.cookies.refreshToken ||
                                     req.body.refreshToken
 
         if(!incomingRefreshToken){
           throw new ApiError(401,"unauthorized request"); 
         }
   
        // user will have encrypted jwt token so need verify to take payload
        const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
 
       const user =  await User.findById(decodedToken._id);
 
       if(!user){
         throw new ApiError(401,"Invalid refresh Token");
       }
 
 
       if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Refresh Token is expired or used")
       }
 
           // working similar like login 
         const options ={
           httpOnly:true,
           secure:true,
         }
           // regenerate accessToken and refreshToken again 
       const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id);
 
         return res.status(200) // generate cookie
         .cookie("accessToken",accessToken, options)
         .cookie("refreshToken",newrefreshToken,options)
         .json(
           new ApiResponse(
             200,
             {accessToken, refreshToken : newrefreshToken},
             "Access Token refreshed"    
           )
         )

     } catch (error) {
      throw new ApiError(401,error?.message ||
        "Invalid Refresh Token")
     }
 

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  try {
     const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id); // get req.user from auth  middleware
  
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  
    if(!isPasswordCorrect){
      throw new ApiError(401,"Invalid Old Password ")
    }
  
       user.password = newPassword;
        await user.save({validateBeforeSave:false})
  
        return res.status(200).json(
          new ApiResponse(200,{},"Password changed successfully")
        )
  } catch (error) {
       return res.status(500).json(
        new ApiError(500,error.message || "Can not change Password ")
       )
  }

})


const getCurrentUser = asyncHandler(async(req,res)=>{
     try {
      return res.status(200).json( new ApiResponse(
        200,
        req.user,
        "Current user fetched succesfully !"
      ))

     } catch (error) {
       return res.status(404).json(
        new ApiError(200,"User Can not be fetched ")
       )
     }
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
     try {
      const {fullName,email} = req.body
 
      if(!fullName || !email){
       throw new ApiError(400,"All fields are required")
      }
 
     const user =  await User.findByIdAndUpdate(
       req.user?._id,
       {
         $set:{
           fullName,
           email
         }
       },
       { new:true }
      )
      .select("-password -refreshToken")
 
     return res.status(200)
     .json(
       new ApiResponse(
        200,user,"Account Details updated Successfully")
     )


     } catch (error) {
         return res.status(500,error.message || "Can not update Account details ")
     }
     
})

const updateUserAvatar = asyncHandler( async(req,res)=>{
      try {
         // since using getting  file from multer middleware so use req.file not req.files 
         // req.files is used if got multiple files in multer
         const avatarLocalPath = req.file?.path;
  
         if(!avatarLocalPath){
          throw new ApiError(400,"Avatar file is missing")
         }
  
        const avatar =   await uploadOnCloudinary(avatarLocalPath)
  
        if(!avatar.url){
          throw new ApiError(400,"Error while uploading on avatar")
        }
  
        const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
            $set:{
              avatar: avatar.url
            }
          },
          {new:true}
        ).select("-password -refreshToken")

        return res.status(200).json(
          new ApiResponse(200,user,"Avatar Image updated Successfully ")
        )

      } catch (error) {
          return res.status(500).json(
            new ApiError(500,error.message || "Can not update Avatar ")
          )
      }
})



const updateUserCoverImage = asyncHandler( async(req,res)=>{
      try {
         // taking single file in multer middleware 
         const coverImageLocalPath = req.file?.path;
  
         if(!coverImageLocalPath){
          throw new ApiError(400,"Cover Image file is missing")
         }
  
        const coverImage =   await uploadOnCloudinary(coverImageLocalPath)
  
        if(!coverImage.url){
          throw new ApiError(400,"Error while uploading on cover Image")
        }
  
        const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
            $set:{
              coverImage: coverImage.url
            }
          },
          {new:true}
        ).select("-password -refreshToken")

        return res.status(200).json(
          new ApiResponse(200,user,"Cover Image updated Successfully ")
        )

      } catch (error) {
          return res.status(500).json(
            new ApiError(500,error.message || "Can not update Cover Image ")
          )
      }
})

// mongodb aggregate function used 
const getUserChannelProfile = asyncHandler(async(req,res)=>{
 // visiting which channel getting that channel information and just getting the subscriber and subscribed count with whether I have subscribed it
    const {username} = req.params; // getting username of the channel which we have visited now for example : codewithakshay channel click 
                                    // so if on codewithakshay channel then below whole code work for codewithakshay channel get 
                                    // take small example to understand 
    if(!username){
       throw new ApiError(400,"Username is missing")
    }

     // aggregate takes array and returns array
   const channel =  await User.aggregate([
      {
        $match:{
          username: username?.toLowerCase()
        }
      },// stage 1 to match
      {  // To get how subscriber do I have 
        $lookup:{// lookup will check the data from another collection for current data
            from:"subscriptions",// from subscriptions collection
            localField:"_id", // username field to be matched 
            foreignField:"channel",// check usename same in channel field
            as:"subscribers"

        }
      }, // to get field with channel name as username  stage 2 
      { // To get whome I have subscribed
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",// find whome I have subscribed
            as:"subscribedTo" 
         }
      }, // to get field with subscriber name as usename stage 3 
      { //additional fields will be added in User --------------------
        $addFields:{
          subscribersCount:{
              $size:"$subscribers"// from  2nd stage used $ since it is field now 
          },
          channelsSubscripbedToCount:{
              $size:"$subscribedTo"
          },
          isSubscribed:{// for subscribe button 
              $cond:{
                if:{$in:[req.user?._id, "$subscribers.subscriber"]}, //checking my account id  is in the field of subscriber of current  channel selected whose name is taken from req.params  
                then:true,// if available user then true in isSubscribed
                else:false // else put false

              }
          }
        }
      }, // fields added stage 4 
      {
         $project:{// to show selected data only exa. fullName
            fullName:1,
            username:1,
            subscribersCount:1,
            channelsSubscripbedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1


         }
      } // which data to be shown stagen 5
    ])


    if(!channel?.length){
      throw new ApiError(404,"Channel does not exists")
    } // channel return an array

    return res.status(200).json(
      new ApiResponse(200,channel[0],"User channel fetched successfully")
    )
    
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile


}