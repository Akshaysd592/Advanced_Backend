
import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
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






export default router; // now router can be imported by any name