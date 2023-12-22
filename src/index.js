import mongoose from 'mongoose'
import { DB_NAME } from './constants.js';
import app from './app.js'
import dotenv from 'dotenv'
dotenv.config({
    path:'./env'
});

// require('dotenv').config({path:'./env'})

import connectDB from './db/index.js'; // sometime gives error so instread of './db/index' use './db/index.js'

connectDB() // this is async and await so it will return promise 
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is started at port ${process.env.PORT}`); 
    })

    app.on("error",(error)=>{ // this is not compulsory
        console.log("Error occured",error)
        throw error;
    })

})
.catch((error)=>{
    console.log("DB connection failed ", error);

})











//1. Database connection method 1  

// import express from 'express'
// const app = express()
// (async()=>{
//     try {
//      await   mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`  )
       

//         // to handle some errors than database connection lile express server
//         app.on("error",()=>{
//                 console.log("Error",error);
//                 throw error;
//         })

//         // server start
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
        
//     } catch (error) {
//         console.error("Error", error);
//     }
// })()