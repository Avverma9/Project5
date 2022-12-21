const productModel = require('../Models/productsModels')
const validator = require('../validators/validator')
const aws =require('./aws')


/*-------------------------Product create ---------------------------------*/

const createProduct =async (req,res)=>{
     
    try{
   const data=req.body;
   let productImage = req.files
   const {title,description,price,availableSizes}  = data

   /*------------------------- validation ---------------------------------*/
     if(!validator.valid(title)){
        return res.status(400).send({status:false,message:"Please provide title"})
     }
     const checktitle= await productModel.findOne({title:title})
     if(checktitle){
        return res.status(400).send({status:false,message:"Please provide unquie title"})
     }
     if(!validator.valid(description)){
        return res.status(400).send({status:false,message:"Please provide description"})
     }
     if(!validator.valid(price)){
        return res.status(400).send({status:false,message:"Please provide description"})
     }

     if(!["S", "XS","M","X", "L","XXL", "XL"].includes(availableSizes)){
        return res.status(400).send({status:false,message:"Please provide availableSizes type bleow" ,likethis:["S", "XS","M","X", "L","XXL", "XL"]})
     }
     
     if(!productImage){
        return res.status(400).send({status:false,message:"Please provide productImage"})
     }
     /*-------------------------create url ---------------------------------*/
     const uploadedFileURL = await aws.uploadFile(productImage[0])
     
     data.productImage=uploadedFileURL;

     /*-------------------------create product ---------------------------------*/

     const createProduct = await productModel.create(data)
     return res.status(201).send({status:true,data:createProduct})
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
     
}


/*-------------------------Product Update ---------------------------------*/


const updateproduct = async (req,res)=>{
    
    try{

    const productid=req.pharms.productId
    const body=req.body;
    let productImage = req.files
    const {title,description,price}  = body

   /*-------------------------productid validation ---------------------------------*/
    if(!productid){
        return res.status(400).send({status:false,message:"please provide productid"})
    }
    if(!validator.isValidObjectId(productid)){
        return res.status(400).send({status:false,message:"please provide correct productid"})
    }
    const checkproductid = await productModel.findById({_id:productid,isDeleted:false})

    if(!checkproductid){
        return res.status(400).send({status:false,message:"please provide register productid"})
    }
    
    /*-------------------------body validation ---------------------------------*/
      if(title){
    if(!validator.valid(title)){
        return res.status(400).send({status:false,message:"Please provide title"})
     }}

        if(description){
     if(!validator.valid(description)){
        return res.status(400).send({status:false,message:"Please provide description"})
     }}
        if(price){
     if(!validator.valid(price)){
        return res.status(400).send({status:false,message:"Please provide description"})
     }}

     const data = {
        ...body
     }


     if(productImage){
        const uploadedFileURL = await aws.uploadFile(productImage[0])
        data.productImage=uploadedFileURL;
     }
       updateproduct = await productModel.updateOne({id:productid},data,{new:true})
    }
    catch(err){
        return res.status(5000).send({status:false,message:err.message})
    }

}

//-----------------------------Get Product By Id --------------------------------//

 const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "please enter valid productId" })
        }
        let product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }
        res.status(200).send({ status: true, message: 'Success', data: product })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }}

//--------------------- deleteProduct ----------------------------///


const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "please enter valid productId" })
        }

        let product = await productModel.findById(productId)

        if (!product) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }
        else {
            if (product.isDeleted == true)
                return res.status(404).send({ status: false, message: "Product Already deleted" })
        }
        await productModel.findByIdAndUpdate({_id:productId}, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, message: "Product Deleted Successfully" })
    }catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }}

//--------------------- Get Product by Query ----------------------------///

const getProductsByFilter = async function (req, res){
    try{
         let obj  = req.query
         let filter = {isDeleted : false}
         let { size, name, priceLessThan, priceGreaterThan, priceSort} = obj
         
         if (Object.keys(obj).length === 0 ) {
            return res.status(400).send({ status: false, message: "Please give some parameters." })
       }

       if(Object.keys(obj).length != 0){

        if (size) {
            if(!validSize(size)){
                return res.status(400).send({ status : false, message : "Size is not valid"})
            }
            filter['availableSizes'] = {$in : size}
    }

    if(name){
        filter['title'] = {$regex : name}
    }

    if(priceLessThan){
        if(!validPrice(priceLessThan)){
            return res.status(400).send({ status : false, message : "Price is not valid"})
        }
        filter['price'] = {$lt : priceLessThan}
    }

    if(priceGreaterThan){
        if(!validPrice(priceGreaterThan)){
            return res.status(400).send({ status : false, message : "Not a valid Price"})
        }
        filter['price'] = {$gt : priceGreaterThan}
    }

    if(priceSort){
        if(!(priceSort == 1 || priceSort == -1)){
            return res.status(400).send({ status : false, message : "Price can be sorted with the value 1 or -1 only"})
        }
    }
}

    let productDetails = await productmodel.find(filter).sort({ price: priceSort })
    if(productDetails.length === 0){
        return res.status(404).send({ status : false, message : "no data found"})
    }
    return res.status(200).send({ status: true, message: 'Success', data: productDetails })


    }catch(error){
        return res.status(500).send({ error : error.message })
    }
}


module.exports={createProduct,updateproduct,deleteProduct,getProductById,getProductsByFilter}