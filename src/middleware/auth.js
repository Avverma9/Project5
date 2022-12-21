const jwt = require("jsonwebtoken")
const userModel = require("../Models/usermodel")
const validator = require("../validators/validator")

const authentication = async function (req, res, next) {
    try {
        let token = req.headers['authorization'];

        if (!token) return res.status(400).send({ status: false, msg: "login is required" })
        if (token.startsWith('Bearer')) {
            token = token.slice(7, token.length)
        }
         try{
        let decodedtoken = jwt.verify(token, "we-are-from-group10")
            req.userId=decodedtoken.payload.userId
        }
         catch(error){
         return res.status(401).send({ status: false, msg: "token is invalid" })
         }


        next()
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })
    }
}


const authorisation = async function (req, res, next) {
    try {
        const userid=req.pharms.userId
         if(req.userId==userid)
        next();
        else
        return res.status(403).send({ status:false, message:"not authorise"})
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status:false, message: error.message })
    }
}



module.exports.authentication = authentication;
module.exports.authorisation = authorisation;