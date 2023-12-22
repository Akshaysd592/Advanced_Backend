import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim : true,
        index:true      // index is helpful in searching 
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true  
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index : true 
    },
    avatar:{
        type:String , // cloudinary url used
        required:true,
        
    },
    coverImage:{
        type:String, // cloudinary

    },
    watchHistory:[
        {
            type:  Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String
    }



},
{timestamps:true})

// just before data stored
userSchema.pre("save", async function(next){ // not using  arrow function because it can not point to current object
                                          // next used because this function  is like middleware 
  
   // this password should not change each time , only when made modification in it 
   if(!this.isModified("password")) return next() // if not modified the just return 

    this.password = await bcrypt.hash(this.password,10); // else
    next();
})



// you can add your own methods to do additional work using .methods 
userSchema.methods.isPasswordCorrect = async function(password){
    return await  bcrypt.compare(password,this.password);
}


userSchema.methods.generateAccessToken = function(){
        return jwt.sign(

            { // payload or data 
                _id : this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,// secret key
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY // option 
            }

        )
}


userSchema.methods.generateRefreshToken = function(){
     return jwt.sign( // this also generate token but expires in more days with less data 
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
     )
}



export const User = mongoose.model("User",userSchema);