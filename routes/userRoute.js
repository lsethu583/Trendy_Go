const express=require("express")
const user_route=express()


const auth=require('../middleware/auth')
const session = require('express-session');
const cartController=require("../controllers/userControllers/cartController")
const userController=require("../controllers/userControllers/userControllers")


user_route.set("view engine","ejs")
user_route.set("views","./views")

user_route.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

user_route.get("/register",auth.isLogout,userController.loadRegister)
user_route.post("/register",userController.insertUser)
user_route.get("/otp",userController.loadVerifyOtp) 
user_route.post("/otp",userController.verifyOtp)
user_route.get('/resend-otp',userController.resendOTP)
user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.post('/login',userController.verifyLogin)
user_route.get('/',userController.loadHome)
user_route.get('/logout',auth.isLogin,userController.userLogout)

user_route.get('/forgotpassword',userController.sendForgotOTP)
user_route.post('/forgotpassword',userController.verifyOtp)
user_route.get('/resend-forgototp',userController.resendForgotOTP)
user_route.post('/forgotverification',userController.verifyResendOTP)
user_route.post('/changepassword',userController.changePassword)

user_route.get('/shop',auth.isLogin,userController.loadShop)
user_route.get('/singleProduct/:id',auth.isLogin,userController.loadSingleshop)
user_route.get('/productdetail',userController.loadProductDetail)

user_route.get('/cart',auth.isLogin,cartController.loadCartPage );
user_route.get('/addtocart',auth.isLogin,cartController.addToCart)
user_route.delete('/removeitem-cart',auth.isLogin,cartController.removeCartProduct)
user_route.put('/updateQuantity',auth.isLogin,cartController.updateQuantity)

user_route.post('/updateuser',userController.updateUser);
// user_route.post('/updatepropic',upload.array('image',1),userController.uploadUserImg);
user_route.get('/useraccount',auth.isLogin,userController.loadAccount);

user_route.get('/address-form',auth.isLogin,userController.getAddressForm)
user_route.post('/address-form',userController.addAddress)
user_route.get('/editaddress',auth.isLogin,userController.loadEditAddress)
user_route.post('/editaddress',userController.updateAddress)

module.exports=user_route;
