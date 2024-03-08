const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
        addresstype:{type:String},
        name:{type:String},
        housename:{type:String},
        landmark:{type:String},
        city:{type:String},
        state:{type:String},
        pincode:{type:Number},
        phone:{type:Number},
        altphone:{type:String},
        
});


const orderSchema = new mongoose.Schema({
      
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    orderId:{
        type:String,

    },
    products: [{
        productId: {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "Product",
            required:true
        },
        quantity: {
            type: Number,
            required:true
        },
        size:{
            type:String,
            required:true
        }
    }],
    address:{
        type:addressSchema,
        required:true
    },
    orderDate:{
        type:Date,
        default:Date.now,
    },
    totalAmount:{
        type:Number,
        required:true
    },
    orderStatus:{
        type:String,
        enum:["Order Placed","Shipped","Delivered","Cancelled","Returned"],
        default:"Order Placed"
    },
    paymentStatus:{
        type:String,
        enum:["Pending","Success","Failed","Refunded"],
        default:"Pending"
    },
    paymentMethod:{
        type:String,
        required:true
    },
    cancelReason:{
        type:String,

    },
    returnReason:{
        type:String
    },
    razoID:{
        type:String
    },
    discount:{
        type:Number,
        default:0
    },
    appliedcoupon:{
        type:String
    },
    discountedAmount:{
        type:Number,
        default:0
    }

});
  

const Orders = mongoose.model("Order", orderSchema);
module.exports = Orders;