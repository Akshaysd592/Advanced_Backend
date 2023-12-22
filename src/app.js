import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app  = express();

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






// export {app};
export default app;