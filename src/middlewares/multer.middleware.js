import multer from "multer" ;

// diskStorage is more in size
const storage = multer.diskStorage(
    {
        destination: function(req,file,cb){ // cb => callback 
          cb(null,"./public/temp")
        },
        filename: function(req,file,cb){

            cb(null,file.originalname)
        }
    }
)


export const upload = multer({
    storage,
})