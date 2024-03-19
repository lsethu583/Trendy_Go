const mongoose = require("mongoose");


const addWishlistSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        products: {
            
                type:  mongoose.Schema.Types.ObjectId,
                ref : "Product"
            
           
        },
        quantity: {
            type: Number,
        },
        size:{
            type:String
        }
    });
const Wishlist = mongoose.model("Wishlist", addWishlistSchema)
module.exports = Wishlist;