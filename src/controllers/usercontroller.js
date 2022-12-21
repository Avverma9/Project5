const usermodel = require('../Models/usermodel') 
const jwt=require('jsonwebtoken')
const bcrypt = require("bcrypt")
const validator = require('../validators/validator')
const aws =require('./aws')

/*-------------------------user create api ---------------------------------*/
const createUser = async function ( req,res){
    try{
        let data = req.body
        if (Object.keys(data)==0){ return res.status(400).send({status : false, message : "body can't be empty"})}
        let files = req.files
        if(files.length ==0) {return res.status(400).send({status : false, message : "file can't be empty"})}

    if (!(validator.valid(data.fname))) { return res.status(400).send({ status: false, message: "First Name is required" }) }

    if (!(validator.valid(data.lname))) { return res.status(400).send({ status: false, message: "Last Name is required" }) }

    if (!(validator.valid(data.email))) { return res.status(400).send({ status: false, message: "Email is required" }) }

    if (!(validator.validEmail(data.email))) { return res.status(400).send({ status: false, message: "Please provide a valid email" }) }

    let isUniqueEMAIL = await usermodel.findOne({ email: data.email })
    if (isUniqueEMAIL) { return res.status(400).send({ status: false, message: `User already exist with this ${data.email}. Login instead ?` }) }

    if (!(validator.valid(data.phone))) { return res.status(400).send({ status: false, message: "Phone number is required" }) }

    if (!(validator.validPhone(data.phone))) { return res.status(400).send({ status: false, message: "Please provide a valid Indian phone number with country code (+91..)" }) }

    let isUniquePhone = await usermodel.findOne({ phone: data.phone })
    if (isUniquePhone) { return res.status(400).send({ status: false, message: `User already exist with this ${data.phone}.` }) }

    if (!(validator.valid(data.password))) { return res.status(400).send({ status: false, message: "Password is required" }) }

    if (data.password.trim().length < 8 || data.password.trim().length > 15) { return res.status(400).send({ status: false, message: 'Password should be of minimum 8 characters & maximum 15 characters' }) }

    if (data.address == null) { return res.status(400).send({ status: false, message: "Please provide your address"})}

    let address = JSON.parse(data.address)

    if (!(validator.valid(address.shipping.street))) { return res.status(400).send({ status: true, message: " Street address is required" }) }

    if (!(validator.valid(address.shipping.city))) { return res.status(400).send({ status: true, message: "  City is required" }) }

    if (!(validator.valid(address.shipping.pincode))) { return res.status(400).send({ status: true, message: " Pincode is required" }) }

    if(!(validator.validPincode(address.shipping.pincode))) { return res.status(400).send({ status: false, message: "Please provide pincode in 6 digit number"})}

    if (!(validator.valid(address.billing.street))) { return res.status(400).send({ status: true, message: " Street billing address is required" }) }

    if (!(validator.valid(address.billing.city))) { return res.status(400).send({ status: true, message: " City billing address is required" }) }

    if (!(validator.valid(address.billing.pincode))) { return res.status(400).send({ status: true, message: " Billing pincode is required" }) }

    if(!(validator.validPincode(address.billing.pincode))) { return res.status(400).send({ status: false, message: "Please provide pincode in 6 digit number"})}

    //encrypting password
    const saltRounds = 10;
    hash = await bcrypt.hash(data.password, saltRounds);

    const uploadedFileURL = await aws.uploadFile(files[0])

    data.profileImage = uploadedFileURL;

    data.password = hash;

    data.address = address;

    const newUser = await usermodel.create(data);

    return res.status(201).send({ status: true, message: 'success', data: newUser })


}
catch (error) {
    console.log(error)
    return res.status(500).send({ message: error.message })
}
}

/*-------------------------user login api ---------------------------------*/
const userLogin = async function (req, res) {

    try {

        let data = req.body

        let { email, password } = data

        if (!email) return res.status(400).send({ status: false, message: "EmailId required to login" })
        if (!validator.validEmail(email)) { return res.status(400).send({ status: false, message: "Invalid EmailID Format or Please input all letters in lowercase." }) }

    if(!password) return res.status(400).send({ status: false, message: "Password required to login" })
        if (!validator.regexPassword(password)) { return res.status(400).send({ status: false, message: "Invalid Password Format! Password Should be 8 to 15 Characters and have a mixture of uppercase and lowercase letters and contain one symbol and then at least one Number." }) }

        const userData = await usermodel.findOne({ email: email })
        if (!userData) { return res.status(401).send({ status: false, message: "Invalid Login Credentials! You need to register first." }) }

        let checkPassword = await bcrypt.compare(password, userData.password)

        if (checkPassword) {

            let payload = {
                userId: userData['_id'].toString(),
                Batch: 'lithium',
                Project: "Products Management",
                iat: Date.now(),
                exp: Date.now()
            }

            const token = jwt.sign({ payload }, "we-are-from-group10", { expiresIn: 60 * 60 });

    
            let obj = { userId:userData['_id'], token: token }

            return res.status(200).send({ status: true, message: 'User login successfull', data: obj })

        } else {

            return res.status(401).send({ status: false, message: 'Wrong Password' })
        }

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}

/*-------------------------user Get api ---------------------------------*/
const userget = async (req,res)=>{
    try{
   const userid=req.params.userId

   if(!validator.isValidObjectId(userid)){
    return res.status(400).send({status: false, message:"userId is not vaild"})
  }

   if(userid!=req.userId){
    return res.status(400).send({status:false,message:"please provide valid userid"})
   }
   const getuser = await usermodel.findOne({_id:userid})
   return res.status(200).send({status:true,message: "User profile details",data:getuser})
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}


/*-------------------------user Update api---------------------------------*/

const updateUser = async function (req, res) {
    try {
      let userId = req.params.userId 
      let data = req.body
      let files = req.files
      let { fname, lname, email, phone, password,address } = data
  
      if (Object.keys(data).length==0) {
        return res.status(400).send({ status: false, message: "please provide user details" })
      }
      //--------------------checking User -----------------------//
  
      if (!validator.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "User id is not valid" })
      }
      const checkUser = await usermodel.findById(userId)
      if (!checkUser) { return res.status(404).send({ status: false, message: "User not found" }) }
  
  
          const obj = {}
          //---------------------------Validation of fname----------------------------------------//
  
          if (fname) {
              if (!validator.valid(fname)) { return res.status(400).send({ status: false, message: 'please provide valid firstname' }) }
              obj.fname = fname
          }
          //---------------------------Validation of lname----------------------------------------//
  
          if (lname) {
              if (!validator.valid(lname)) { return res.status(400).send({ status: false, message: 'please provide valid lastname' }) }
              obj.lname = lname
          }
          //---------------------------Validation of Email----------------------------------------//
  
          if (email) {
              if (!validator.validEmail(email)) { return res.status(400).send({ status: false, message: 'Please enter valid emailId' }) }
              obj.email = email
          }
          //---------------------------Validation of Phone Number----------------------------------------//
  
          if (phone) {
              if (!validator.validPhone(phone)) { return res.status(400).send({ status: false, message: 'Please enter valid Mobile Number' }) }
              obj.phone = phone
          }
          //---------------------------Validation of Password----------------------------------------//
  
          if (password) {
              if (!validator.regexPassword(password)) { return res.status(400).send({ status: false, message: "password should be have minimum 8 char and max 15 char" }) }
              obj.password = await bcrypt.hash(password, 10)
          }
          //------------------------ validation of image -------------------------
          if (files && files.length > 0) {
              if (files.length > 1) return res.status(400).send({ status: false, message: "You can upload only one image" })
              let uploadedURL = await aws.uploadFile(files[0])
              obj.profileImage = uploadedURL
          }
          //---------------------------Validation of Address----------------------------------------//
  
          if (address) {
              let { shipping, billing } = address
  
              if (shipping) {
                  if (shipping.street) { obj['address.shipping.street'] = shipping.street }
                  if (shipping.city) {
                      if (!validator.isValidCity(shipping.city)) { return res.status(400).send({ status: false, message: 'Invalid Shipping city' }) }
                      obj['address.shipping.city'] = shipping.city
                  }
                  if (shipping.pincode) {
                      if (!validator.validPincode(shipping.pincode)) { return res.status(400).send({ status: false, message: 'Invalid Shipping Pin Code.' }) }
                      obj['address.shipping.pincode'] = shipping.pincode
                  }
              }
  
              //===================== Validation of Billing =====================//
              if (billing) {
                  if (billing.street) { obj['address.billing.street'] = billing.street }
                  if (billing.city) {
                      if (!validator.isValidCity(billing.city)) { return res.status(400).send({ status: false, message: 'Invalid Shipping city' }) }
                      obj['address.billing.city'] = billing.city
                  }
                  if (billing.pincode) {
                      if (!validator.validPin(billing.pincode)) { return res.status(400).send({ status: false, message: 'Invalid Shipping Pin Code.' }) }
                      obj['address.billing.pincode'] = billing.pincode
                  }}}
  
          let updateUser = await usermodel.findOneAndUpdate({ _id: userId },obj, { new: true })
  
          if (!updateUser) { return res.status(200).send({ status: true, message: "User not found with this Id." }) }
  
          return res.status(200).send({ status: true, message: "User profile updated", data: updateUser })
  
      } catch (error) {
  
          return res.status(500).send({ status: false, message: error.message})
  }
  }
module.exports={userget,userLogin,createUser,updateUser}