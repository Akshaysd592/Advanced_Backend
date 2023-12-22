// inheriting from Error class
class ApiError extends Error{
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""

    ){
        super(message) // overriding message data
        this.statusCode = statusCode
        this.data = null 
        this.message = message
        this.success = false
        this.errors =  errors


        // below is provided in documentation for statck
        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}

export {ApiError}