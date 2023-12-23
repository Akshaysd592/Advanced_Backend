

// 1. promises /  then . catch

const asyncHandler = (requestHandler) =>{
  return  (req,res,next)=>
    Promise.resolve(requestHandler(req,res,next))
           .catch((error)=>next(error));
}



export {asyncHandler}



//----------------------------------------------------------- or ===============
//2. To handle try catch wih async await

// const asyncHandler = ()=>{}
// const asyncHandler = (func)=> ()=>{}
// const asyncHandler = (func)=> async ()=>{}


// const asyncHandler = (func)=> async(req,res,next)=>{// declaring async function inside the another function
//     try {
//         // function call 
//      return   await func(req,res,next);
        
        
//     } catch (error) {
//         return res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })

//     }
// }

// export {asyncHandler}