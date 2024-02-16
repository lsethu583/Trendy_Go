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
    res.render('user/forgotpassword',{ message: false })
  } catch (error) {
    console.log(error.message);
  }
};

const sendForgotOTP = async (req, res) => {
  try {
      const email = req.body.email
      const emailExist = await User.find({ email: email })
      const phone = emailExist[0].phone
      if (emailExist.length > 0) {
          const randomOTP = Math.floor(1000 + Math.random() * 9000);

         

          const mailOptions = {
              from: 'trendygosite@gmail.com',
              to: email,
              subject: 'Hello, Trendy_Go!!',
              text: `Your verification OTP is ${randomOTP}`
          };

          // Sending email asynchronously
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.log(error);
                  res.status(500).send({ success: false, message: 'Error sending email' });
              } else {
                  console.log(`Email is sent with verification code ${randomOTP}`, info.response);

                  // Update session OTP
                  req.session.OTP = randomOTP;
                  console.log('re-randomOTP' + randomOTP);
                  isOtpVerified = true;
                  setTimeout(() => {
                      if (isOtpVerified) {
                          req.session.OTP = null;
                          isOtpVerified = false;
                          console.log('Timeout over');
                      }
                  }, OTP_TIMEOUT);
              }
              // Render OTP page after sending email and setting timeout

              res.render('user/forgotpass2', { phone: phone, email: email, msg: false })
          })
      } else {
          console.log(emailExist);
          res.render('user/forgotpass', { message: true })
      }

  } catch (error) {

      res.render('user/forgotpass', { message: `Cant't send OTP right now try after some time` })
     
  }
}

const resendForgotOTP = async (req, res) => {
  try {
      const email = req.query.email;
      const user = await User.find({ email: email })
      const phone = user[0].phone
      if (phone) {
          // Send a new OTP
          const randomOTP = Math.floor(1000 + Math.random() * 9000);
          req.session.OTP = randomOTP;
          const transporter = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                  user: "trendygosite@gmail.com",
                  pass: "qeup vubt ylss npvi",
              },
          });
          console.log(email);
          const mailOptions = {
              from: 'trendygosite@gmail.com',
              to: email,
              subject: 'Hello, Trendy_Go!!',
              text: `Your verification OTP is ${randomOTP}`
          };

          // Sending email asynchronously
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.log(error);
                  res.status(500).send({ success: false, message: 'Error sending email' });
              } else {
                  console.log('re-randomOTP' + randomOTP);
                  console.log(`resent with verification code ${randomOTP}`, info.response);

                  // Update session OTP

                  isOtpVerified = true;
                  setTimeout(() => {
                      if (isOtpVerified) {
                          req.session.OTP = null;
                          isOtpVerified = false;
                          console.log('Timeout over');
                      }
                  }, OTP_TIMEOUT);
              }
          })
          // res.send({ success: true, message: 'OTP resent successfully' });
          res.render('user/forgotpass2', { phone: phone, email: email, msg: false })
      } else {
          res.status(400).send({ success: false, message: 'Invalid phone number' });
      }

  } catch (error) {
      res.redirect('/error')
  }
}

const verifyResendOTP = async (req, res) => {
  try {

      const email = req.body.email
      const otp = req.body.otp;
      const phone = req.body.phone;
      const orginalOTP = req.session.OTP
      console.log(orginalOTP, otp, isOtpVerified);
      if (otp == orginalOTP && isOtpVerified) {
          isOtpVerified = true;
          // Calling the insertUser function to save user data
          const userData = await User.find({ email: email })

          console.log('good');
          if (userData) {
              res.render('user/changepass', { email: email });
          } else {
              res.render('user/forgotpass2', { phone: phone, email: email, msg: true })
          }
      } else {
          console.log('baad');
          isOtpVerified = false;
          res.render('user/forgotpass2', { phone: phone, email: email, msg: true });

      }
  } catch (error) {
      res.redirect('/login')
  }
}

const changePassword = async (req, res) => {
  try {
      const email = req.body.email;
      const newPassword = req.body.newPassword;
      const user = await User.findOne({ email: email });

      if (user) {
          console.log('hello');
          // Update the password field in the user document
          user.password = newPassword;

          // Save the updated user document
          await user.save();
          req.session.user_id = user._id;
          if (req.session.user_id) {
              res.redirect('/')
          } else {
              res.redirect('/login')
          }

      } else {
          res.send({ success: false, message: 'User not found' });
      }
  } catch (error) {
      res.redirect('/login')
  }
};


const getAddressForm = async (req, res) => {
  try {


      res.render('user/addressform')


  } catch (error) {
      console.log(error.message);
  }
}

const addAddress = async (req, res) => {
  try {
      const from   = req.query.from;
      const user_id = req.session.user_id
      const addressname = req.body.addressname
      const phone = req.body.phone
      const city = req.body.city
      const pincode = req.body.pincode
      const landmark = req.body.landmark
      const house = req.body.house
      const altPhone=req.body.altPhone
      const country = req.body.country
      const user = await User.findById(user_id);
      if (user) {

          const newAddress = {
              addressName: addressname,
              phone: phone,
              city: city,
              pincode: pincode,
              landmark: landmark,
              house: house,
              country: country,
              description: description,
              altPhone:altPhone,
              fname:fname,
             lname:lname,
          };
          User.address.push(newAddress);

          await user.save();
          if(from=='checkout'){
              res.redirect('/checkout')
          }else{
              res.redirect('/useraccount')
          }
         

      }
  } catch (error) {
      res.redirect('/error')
  }
}

const loadEditAddress = async (req, res) => {
  try {
      const i = req.query.i
      const act = req.query.act;
      const userId = req.session.user_id
      const user = await User.findById(userId)
      if (act == 0) {
          User.address.splice(i, 1);
          await user.save();
          res.redirect('/useraccount')
      } else {
          res.render('user/editaddress', { user: user, i })
      }
  } catch (error) {
      res.redirect('/error')
  }
}

const updateAddress = async (req, res) => {
  try {
      const userId = req.session.user_id;
      const i = req.body.i; // Index of the address
      const user = await User.findById(userId);
      console.log(i);
      if (user) {
          const updatedAddress = {
              addressName: req.body.addressname,
              phone: req.body.phone,
              city: req.body.city,
              pincode: req.body.pincode,
              landmark: req.body.landmark,
              house: req.body.house,
              country: req.body.country,
              fname:req.body.fname,
               lname:req.body.lname,
              
          };
          User.address[i] = updatedAddress; // Update the address at index i
          await user.save();
          res.redirect('/useraccount');
      }
  } catch (error) {
      res.redirect('/error')
  }
}


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
  
    res.render('user/singleProductDetails',{Product})
  } catch (error) {
    console.log(error.message);
  }
}

const loadAccount = async (req, res) => {
  try {
     
      const userId = req.session.user_id
      const user = await User.findById(req.session.userId)
      const category = await Category.find({})
      const cart = await Cart.find({ userId: userId }).populate('productId');
      const order = await Order.find({ userId: userId })
          .sort({ orderDate: -1 }) // Sort by orderDate in descending order for latest first
          .populate('products.productId');
     
          res.render('user/account', { user, category, cart, order, msg: false})
      
    

  } catch (error) {
      res.redirect('/error')
  }
}

const updateUser = async(req,res)=>{
  try {
      const userId = req.session.user_id
      const name = req.body.name;
      const email = req.body.email;
      const phone = req.body.phone;
      const user = await User.findById(userId); // Replace 'User' with your actual User model

     

     
      user.name = req.body.name;
      user.email = req.body.email;
      user.phone = req.body.phone;

      
      await user.save();

      
      res.redirect('/useraccount');

  } catch (error) {
    console.log(error.message);
  }
}


const uploadUserImg = async(req,res)=>{
  try {
      
      const image= req.files.map(file => file.path)
      const userId = req.session.user_id
      await User.findByIdAndUpdate(userId,{$set:{image:image[0]}})
      
      res.redirect('/useraccount')
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
  sendForgotOTP,
  resendForgotOTP,
  verifyResendOTP,
  changePassword,
  loadShop,
  loadSingleshop,
  loadProductDetail,
  getAddressForm,
  addAddress,
  loadEditAddress,
  updateAddress,
  loadAccount,
  updateUser,
  uploadUserImg
};
