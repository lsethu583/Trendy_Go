const express=require("express")
const user_route=express()
const userController=require("../controllers/userController")
const {generateOTP,sendOTPEmail}=require("../controllers/userController");
const auth=require('../middleware/auth')


user_route.set("view engine","ejs")
user_route.set("views","./views")

user_route.get("/register",auth.isLogout,userController.loadRegister)
user_route.post("/register",userController.insertUser)
user_route.get("/otp",userController.loadVerifyOtp) 
user_route.post("/otp",userController.verifyOtp)
user_route.get('/resend-otp',userController.resendOTP)
user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.post('/login',userController.verifyLogin)
user_route.get('/',auth.isLogin,userController.loadHome)
user_route.get('/logout',auth.isLogin,userController.userLogout)









module.exports=user_route;
