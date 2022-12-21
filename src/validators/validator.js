const mongoose = require("mongoose")

const valid = function (input){
if(typeof(input)=== undefined || typeof(input)===null){ return false}
if(typeof(input)==="string" && input.trim().length>0){ return true}
if(typeof(input)==="number" && input.toString().trim().length>0){ return true}
if(typeof(input)==="object" && input.length>0) {return true}
}

const validEmail = function (email){
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
}

const validPhone = function (phone){
    return /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone);
}
const isValidObjectId = function (objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}
const validPincode = function(pincode){
    if ( /^\+?([1-9]{1})\)?([0-9]{5})$/.test(pincode)) return true
}
const regexPassword = function (password) {
    return (/^(?=.*[A-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/)
        .test(password)
}

exports.isValidAvailableSizes = (availablesizes) => {
    for( i=0 ;i<availablesizes.length; i++){
      if(!["S", "XS","M","X", "L","XXL", "XL"].includes(availablesizes[i])) return false
    }
    return true
  };

  
 exports.isValidPrice = (value) => {
    const regEx =/^[1-9]\d{0,8}(?:\.\d{1,2})?$/
    const result = regEx.test(value)
    return result
  };


module.exports={valid,validEmail,validPhone,isValidObjectId,validPincode,regexPassword}