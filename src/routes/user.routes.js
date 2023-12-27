
import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
const router = Router();
import {verifyJWT} from '../middlewares/auth.middleware.js'

import {upload} from "../middlewares/multer.middleware.js"


router.route("/register").post(
    // middleware
        upload.fields( // since getting two files so two objects in array 
         [              // this will take this files and store on temp folder using multer
            {
                name:"avatar",
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            }
         ]
        )
     ,
     // controller
    registerUser) // http://localhost:8000/api/v1/users/register
                                              // /api/v1/users in comming from app.js

router.route("/login").post(
    loginUser // controller 
)

// secured route------------------------
router.route("/logout").post(
    verifyJWT,// middleware which store req.user = user value
    logoutUser //  controller 
    )

router.route("/refresh-token").post(
    refreshAccessToken
)

router.route("/change-password").post(
     verifyJWT,
     changeCurrentPassword
)

router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
)

// need to update specific data so patch
router.route("/update-account").patch(
      verifyJWT,
      updateAccountDetails
)

router.route("/avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
    )


router.route("/cover-image").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
)

// getting data from params so 
router.route("/channel/:username").get(
    verifyJWT,
    getUserChannelProfile
)

router.route("/history").get(
    verifyJWT,
    getWatchHistory
)




export default router; // now router can be imported by any name