const express=require("express")
const user_route=express()
const auth=require('../middleware/auth')
const session = require('express-session');
const cartController=require("../controllers/userControllers/cartController")
const userController=require("../controllers/userControllers/userControllers")
const userProfileController=require('../controllers/userControllers/userProfileController')
const orderController=require('../controllers/userControllers/orderController')
const wishlistController=require('../controllers/userControllers/wishlistController')
const sortController=require('../controllers/userControllers/sortController')
const walletController=require('../controllers/userControllers/walletController')
const reviewController=require("../controllers/userControllers/reviewController")

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
user_route.post('/update-cart-quantity',auth.isLogin,cartController.updateCartQuantity)
user_route.delete('/removeFromCart',auth.isLogin,cartController.removeFromCart)
// user_route.put('/updateQuantity',auth.isLogin,cartController.updateQuantity)


user_route.get('/profile',auth.isLogin,userProfileController.getProfilePage);
user_route.post('/createaddress',auth.isLogin,userProfileController.addaddress)
user_route.post('/createaddressfromcheckout',auth.isLogin,userProfileController.createAddressFromCheckout)
user_route.get('/getAddress/:addressID',userProfileController.getAddress)

user_route.post('/updateuser',auth.isLogin,userProfileController.updateuserdetails)
user_route.post('/changeuserpass',auth.isLogin,userProfileController.changeuserpassword)

user_route.get('/wishlist',auth.isLogin,wishlistController.loadwishlist)
user_route.post('/wishlist/delete', auth.isLogin, wishlistController.removeFromWishlist);
user_route.post('/wishlist/addtocart',wishlistController.addcartfromwishlist)
user_route.post('/addtowishlistfromhome',auth.isLogin,wishlistController.addtowishlistfromhome)


user_route.get("/categorysort",sortController.categorySort);
user_route.get("/categorysort/lowtohigh",auth.isLogin,sortController.lowToHigh);
user_route.get("/categorysort/hightolow",auth.isLogin,sortController.HighToLow);
user_route.get("/categorysort/A-Z",auth.isLogin,sortController.AtoZ);
user_route.get("/categorysort/Z-A",auth.isLogin,sortController.ZtoA);
user_route.get('/sorting',auth.isLogin,sortController.sorting)
user_route.post("/search",auth.isLogin,sortController.searchProducts)
user_route.get('/products',auth.isLogin,sortController.productList)

user_route.get('/checkout',auth.isLogin,orderController.loadCheckoutPage)
user_route.post('/placeorder',auth.isLogin,orderController.placeorder)
user_route.post('/placeorder/online',auth.isLogin,orderController.placeorderonline)
user_route.get('/getorderdetails',auth.isLogin,orderController.loadorderdetails)
user_route.post("/deleteorder",auth.isLogin,orderController.deleteOrder);
user_route.post("/return",auth.isLogin,orderController.returnOrder);
user_route.post('/cancelreturn',auth.isLogin,orderController.cancelReturn)
user_route.post('/applycoupon',auth.isLogin,orderController.applyCoupon);
user_route.post('/verifypayment',auth.isLogin,orderController.verifyRazorpay);



user_route.get('/orderSuccess',orderController.orderSuccess);

user_route.post('/addToWallet',walletController.addToWallet);
user_route.post('/verifypaymentwallet',walletController.verifyPaymentWallet)

user_route.post('/onlinepaymentfailed',orderController.onlinepaymentfailed)
user_route.get('/repayment',orderController.repayment);
user_route.post('/repayment',orderController.postRepaymentData);

user_route.get('/about',userController.loadaboutpage)
user_route.get('/contact',userController.loadcontactpage)
user_route.post('/contact',userController.postQueries)

// user_route.post("/reviewproduct",reviewController.postReviewDetails);









module.exports=user_route;
