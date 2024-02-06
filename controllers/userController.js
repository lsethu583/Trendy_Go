const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Products=require('../models/productModel')
const Category=require('../models/categoryModel')


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
    // to check whether the registering user is existing using mail and phone number

    const existingUser = await User.findOne({
      $or: [{ email }, { number: phoneNumber }],
    });
    if (existingUser) {
      const message = "Email or phone number already exists";
      res.redirect(`/register?message=${message}`);
    } else {
      // if,the user is not existing
      const hashedPassword = await securePassword(password);

      const currentDate = new Date();

      let obj = {
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        confirmPassword: confirmPassword,
        date: currentDate,
      };
      req.session.obj = obj;
      req.session.email = email;

      res.redirect("/otp");
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .render("register", { message: "An error occured during registration" });
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
    const products=await Products.find({}).populate('productCategory')
    const category=await Category.find({})
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
};
