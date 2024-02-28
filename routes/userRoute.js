const express=require("express")
const user_route=express()
const auth=require('../middleware/auth')
const session = require('express-session');
const cartController=require("../controllers/userControllers/cartController")
const userController=require("../controllers/userControllers/userControllers")
const userProfileController=require('../controllers/userControllers/userProfileController')
const orderController=require('../controllers/userControllers/orderController')

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

user_route.get('/forgotpassword',userController.loadForgotPassword)
user_route.post('/forgotpassword',userController.forgotpassword)
user_route.get('/forgetpassword/otppage',userController.loadOtpPageForPassword)
user_route.post('/forgetpasswordverify',userController.otpVerifyPasswordReset)
user_route.post('/passwordreset',userController.newPasswordReset)

user_route.get('/shop',auth.isLogin,userController.loadShop)
user_route.get('/singleProduct/:id',auth.isLogin,userController.loadSingleshop)
user_route.get('/productdetail',auth.isLogin,userController.loadProductDetail)

user_route.get('/cart',auth.isLogin,auth.isBlocked,cartController.loadCartPage );
user_route.get('/addtocart',auth.isLogin,cartController.addToCart)
user_route.delete('/removeitem-cart',auth.isLogin,cartController.removeCartProduct)
user_route.put('/updateQuantity',auth.isLogin,cartController.updateQuantity)


user_route.get('/profile',auth.isLogin,userProfileController.getProfilePage);
user_route.post('/createaddress',auth.isLogin,userProfileController.addaddress)
user_route.get('/getAddress/:addressID',userProfileController.getAddress)

user_route.get('/checkout',auth.isLogin,orderController.loadCheckoutPage)
user_route.post('/placeorder',auth.isLogin,orderController.placeorder)





module.exports=user_route;
