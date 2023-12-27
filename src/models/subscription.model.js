import mongoose ,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
        subscriber:{
            type: Schema.Types.ObjectId,
            ref:"User" // one who is subscribing
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref:"User"// one whom 'subscriber' is subscribing 
        }
},
{
    timestamps:true
})



export const subscription = mongoose.model("subscription",subscriptionSchema)