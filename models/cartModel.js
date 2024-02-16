const mongoose = require("mongoose");

const addCartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            required:true,
            default:1
        },
        size: {
            type: String,
            required:true
            
        }
    }]
    // Other cart item details except price
});

const Cart = mongoose.model("Cart", addCartSchema);
module.exports = Cart;
