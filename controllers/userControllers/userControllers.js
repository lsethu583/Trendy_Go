const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Products=require('../../models/productModel')
const Category=require('../../models/categoryModel')
const Cart=require('../../models/cartModel')




const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    const message = req.query.message || "";

    res.render("user/register", { message });
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber,
    } = req.body;
    // Check whether the registering user already exists using email and phone number

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      const message = "Email or phone number already exists";
      res.render('user/register', { message });
    } else {
      // If the user does not exist
      const hashedPassword = await securePassword(password);

      const currentDate = new Date();

      let obj = {
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        confirmPassword,
        date: currentDate,
      };
      req.session.obj = obj;
      req.session.email = email;

      // Set a success message for successful registration
      req.session.success_msg = "Registration successful!";
      res.redirect("/otp");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("register", { message: "An error occurred during registration" });
  }
};

const loadLogin = async(req,res)=>{
  try {
    res.render('user/login',{ message: req.session.err_msg })
  } catch (error) {
    console.log(error.message);
  }
}

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      const isActive = userData.isActive; // Assuming there is an 'isActive' field in your user model

      if (passwordMatch && userData.is_admin === 0 && isActive) {
        req.session.user_id = userData._id;
        res.redirect('/');
      } else {
        // Set a more specific error message for invalid password or inactive account
        if (!passwordMatch) {
          req.session.err_msg = "Invalid Password";
        } else if (userData.is_admin !== 0) {
          req.session.err_msg = "Admin can't login here!";
        } else if (!isActive) {
          req.session.err_msg = "Account is blocked!! ";
        }
        res.redirect('/login');
      }
    } else {
      // Set a more specific error message for invalid user
      req.session.err_msg = "Invalid User";
      res.redirect('/login');
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};




const loadHome=async(req,res)=>{
  try {
    let products = [];
    let category = [];
    if(req.session.user_id){
     products=await Products.find({}).populate('productCategory')
     category=await Category.find({})
    
    }
    res.render('user/home',{products,category})
      
    
  } catch (error) {
    console.log(error.message);
  }
}

const userLogout = async(req,res)=>{
  try {
      req.session.user_id=null
      res.redirect('/')
  } catch (error) {
      console.log(error.message)
  }
}


const loadVerifyOtp = async (req, res) => {
  try {
     const otp = generateOTP(4); 
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.randomOtp = randomOtp;
      console.log(randomOtp)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "trendygosite@gmail.com",
        pass: "qeup vubt ylss npvi",
      },
    });
  
      const mailOptions = {
        from: "trendygosite@gmail.com",
        to: req.session.email,
        subject: "OTP Verification",
        text: `Your OTP for verification is: ${randomOtp}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent", info.response);
        }
      });
  
      res.render("user/otp"); // Corrected path to the "otp" view
    } catch (error) {
      console.log(error.message);
    }
  };
  
  function generateOTP(length) {
    const characters = '0123456789'; // The characters to use for the OTP
    let otp = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
    }
  
    return otp;
  }

//otp

const verifyOtp = async (req, res) => {
  try {
    const obj = req.session.obj;
    const otp = req.body.otp;
    const randomOtp = req.session.randomOtp;
    
    if (otp == randomOtp) {
      const user = new User({
        firstName: obj.firstName, // Potential cause of the error
        lastName: obj.lastName,
        email: obj.email,
        phone: obj.phoneNumber,
        password: obj.password,
        confirmPassword: obj.confirmPassword,
        is_admin: 0,
      });

     

      const userData = await user.save();
      // Create a cart for the user
      const newCart = new Cart({
        userId: userData._id,
        products: []
    });
    // Save the cart to the database
    await newCart.save();

      console.log(userData);
    //   res.send("OTP verification successful");
    res.redirect("/login")//loginpage

    } else {
      res.render("user/otp", { error: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resendOTP = async (req, res) => {
  try {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      req.session.randomOtp = randomOtp;
      console.log(randomOtp);

      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: "trendygosite@gmail.com",
              pass: "qeup vubt ylss npvi",
          },
      });

      const mailOptions = {
          from: "trendygosite@gmail.com",
          to: req.session.email,
          subject: "Resent OTP Verification",
          text: `Your new OTP for verification is: ${randomOtp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log("Error sending email:", error);
              res.status(500).json({ error: "Failed to resend OTP" });
          } else {
              console.log("Email sent", info.response);
              res.status(200).json({ message: "OTP Resent!" });
          }
      });
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Failed to resend OTP" });
  }
};

const loadForgotPassword=async(req,res)=>{
  try {
    res.render('user/forgotpassword')
  } catch (error) {
    console.log(error.message);
  }
};

const forgotpassword = async(req,res)=>{
  try{
   const email  = req.body.email;
   const existingUser = await User.findOne({email:email});
     if(existingUser){
      const otp = generateOTP(4); 
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      req.session.randomOtp = randomOtp;
        console.log(randomOtp)
        req.session.email=email;
        console.log( req.session.email);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "trendygosite@gmail.com",
          pass: "qeup vubt ylss npvi",
        },
      });
    
        const mailOptions = {
          from: "trendygosite@gmail.com",
          to: req.body.email,
          subject: "OTP Verification",
          text: `Your OTP for verification is: ${randomOtp}`,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
         
            console.log("Email sent", info.response);
          
        });
       
        res.json({redirect:"/forgetpassword/otppage"}); // Corrected path to the "otp" view
      } 
    }catch (error) {
        console.log(error.message);
      }
    };

    const loadOtpPageForPassword=async(req,res)=>{
      try{
          res.render("user/otpPasswordVerify")
      }
      catch(error){
          console.log(error);
      }
  }

  const otpVerifyPasswordReset = async(req,res)=>{
   
    try{
        const userEnteredOtp = req.body.otp;
    const randomOtp = req.session.randomOtp || req.session.newOtp ;
       
       
        if(userEnteredOtp === randomOtp){
          
                res.render("user/passwordreset")

                
        }else{
            res.render("user/otpPasswordVerify",{message:"OTP mismatch try again"})
        }
        


    }
    catch(error){
        console.log(error,"otpVerifyPasswordReset  page  error ");

    }
}

const newPasswordReset = async (req, res) => {
  try {
    const userEmail = req.session.email;
    console.log(userEmail);

    // Assuming you set the email in the session earlier
    if (!userEmail) {
      throw new Error("User email not found in session");
    }

    const password = req.body.password;
    const securePassword =  await bcrypt.hash(password, 10);
    
    const updatedData = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { password: securePassword } }
    );
    
    if (updatedData) {
      // Reset the email in the session after successful password reset
      delete req.session.email;
      res.redirect("/login");
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/forgotpassword"); // Redirect the user back to the forgot password page in case of an error
  }
};







const loadShop=async(req,res)=>{
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const productData = await Products.find({is_Listed:true});
    console.log(productData);
    const categories = await Category.find();
    res.render("user/shop", { products: productData });
  } catch (error) {
    console.log(error.message);
  }
}

const loadSingleshop=async(req,res)=>{
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const productId = req.params.id;
    const product = await Products.findById(productId);
    const categories = await Category.find();

    res.render("user/singleProduct", { userData, product, categories });
  } catch (error) {
    console.log(error.message);
  }
}

const loadProductDetail=async(req,res)=>{
  try {
    const productId=req.query.id;
    
    const Product = await Products.findById(productId).populate('productCategory')
    console.log("product : ",Product);
  
    res.render('user/singleProductDetails',{Product})
  } catch (error) {
    console.log(error.message);
  }
}






module.exports = {
  loadRegister,
  insertUser,
  loadVerifyOtp,
  verifyOtp,
  loadLogin,
  verifyLogin,
  loadHome,
  resendOTP,
  userLogout,
  loadForgotPassword,
  forgotpassword,
  loadOtpPageForPassword,
  otpVerifyPasswordReset,
  newPasswordReset,
  loadShop,
  loadSingleshop,
  loadProductDetail,
  
  
};
