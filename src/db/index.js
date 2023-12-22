import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async()=>{
    try {

   const connectionInstance = await  mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`) // this will return object stored in variable
        console.log(`\n MongoDB connection successfull !!  DB HOST : ${connectionInstance.connection.host} `);


    } catch (error) {
        console.log("MONGODB connecion error",error);
        process.exit(1); // mongoose provide capability to take current process amd exit from it
    } 
}

export default connectDB;