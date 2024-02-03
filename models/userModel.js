const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,

      },
      lastName: {
        type: String,
        required: true,
       
      },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone:{
    type:String,
    required:true,
    unique:true
  },
  password: {
    type: String,
   
  },
  isActive:{
    type:Boolean,
    default:true
  },
  wallet:{
    type:Number
  },
  adress:[{
    adressName:{type:String},
    house:{type:String},
    city:{type:String},
    landmark:{type:String},
    state:{type:String},
    pincode:{type:Number},
    adressType:{type:String},
    phone:{type:String},
    email:{type:String},
    altPhone:{type:String}
  }],
  date:{
    type:Date,
    default:Date.now()
  },
  is_admin:{
    type:Number,
    required:true,
    default:0
  }


  // Add more fields as needed for your application (e.g., name, age, etc.)
});

const User = mongoose.model('User', userSchema);

module.exports = User;
