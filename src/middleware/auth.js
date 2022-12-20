const jwt = require("jsonwebtoken")
const userModel = require("../Models/userModel")
const validator = require("../validator/validator")

const authentication = async function (req, res, next) {
    try {
        let token = req.headers['authorization'];

        if (!token) return res.status(400).send({ status: false, msg: "login is required" })

        if (token.startsWith('Bearer')) {
            token = token.slice(7, token.length)
        }


        let decodedtoken = jwt.verify(token, "Secret-Key", { ignoreExpiration: true })
        if (!decodedtoken) return res.status(401).send({ status: false, msg: "token is invalid" })
        

        let time = Math.floor(Date.now() / 1000)
        if (decodedtoken.exp < time) {
            return res.status(401).send({ status: false, message: "token expired, please login again" });
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
        let token = req.headers['authorization'];
        
        if (token.startsWith('Bearer')) {
            token = token.slice(7, token.length)
        }

        let decodedtoken = jwt.verify(token, "Secret-Key", 
        )


        let toBeupdateduserId = req.params.userId

        if (!(validator.isValidObjectId(toBeupdateduserId))) {return res.status(400).send({status: false, message: 'Please provide a valid User Id'})}


        let updatinguserId = await userModel.find({ _id: toBeupdateduserId }).select({ _id: 1 })
        let userId = updatinguserId.map(x => x._id)


        let id = decodedtoken.userId
        if (id != userId) return res.status(403).send({ status: false, msg: "You are not authorised to perform this task" })


        next();
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })
    }
}



module.exports.authentication = authentication;
module.exports.authorisation = authorisation;