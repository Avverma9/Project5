const express =require('express')
const router=express.Router();
const usercontroller =require('../controllers/usercontroller');
const productcontroller =require('../controllers/productController')
const auth = require('../middleware/auth')

/*-------------------------user end points ---------------------------------*/
router.get('/user/:userId/profile',auth.authentication ,usercontroller.userget)
router.post('/register',usercontroller.createUser)
router.post('/login',usercontroller.userLogin)
router.put('/user/:userId/profile',usercontroller.updateUser)

/*-------------------------Products end points---------------------------------*/
router.post('/products',productcontroller.createProduct)
router.post('/products/:productId',productcontroller.updateproduct)



module.exports=router;