import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app  = express();


// middleware -----------------------
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true

})); 


// to get data in json form 
app.use(express.json(
    {
        limit:"16kb"
    }
))

// to handle data from url this will make it automatically
app.use(express.urlencoded(
    {
        extended:true,
        limit:"16kb"
    }
))

// to put assets in public folder
app.use(express.static("public"))

// to access and use cookies 
app.use(cookieParser());




//  routes import  ---------------------

import userRouter from './routes/user.routes.js'; // when used export default then can use any name to import 
                                                  // when not export default then need to use {router} to import 

app.use("/api/v1/users",userRouter);




// export {app};
export default app;