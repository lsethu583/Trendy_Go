const Wishlist=require('../../models/wishlistSchema')
const Cart=require('../../models/cartModel')
const User=require('../../models/userModel')
const Products=require('../../models/productModel')
const Category=require('../../models/categoryModel')

const mongoose = require('mongoose');

const loadwishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log("user id : ", userId);

        // Assuming you have a Wishlist model imported and properly defined
        // Assuming that the `products` field in the Wishlist schema is a reference to the Product model
        const wishlist = await Wishlist.find({userId:userId}).populate("products")
           
        
        
            

        // Now wishlist will contain the populated product details
        console.log("wishlist : ", wishlist);

        res.render('user/wishlist', { wishlist, userId });
    } catch (error) {
        console.log(error.message);
    }
};



// const addtowishlist = async (req, res) => {
//     try {
//         const userId = req.session.user_id; // Assuming you're using session-based authentication
//         const productId = req.body.productId;

//         // Check if the product already exists in the wishlist
//         const existingWishlist = await Wishlist.findOne({ userId: userId });
//         if (existingWishlist) {
//             const found = existingWishlist.products.some(elem => elem.productId == productId);
//             if (found) {
//                 return res.status(400).json({ error: 'Product already exists in wishlist' });
//             }
//         }

//         // If wishlist doesn't exist for the user, create a new one
//         if (!existingWishlist) {
//             const newWishlist = new Wishlist({
//                 userId: userId,
//                 products: [{ productId: productId }]
//             });
//             await newWishlist.save();
//         } else {
//             // If wishlist exists, update it to add the new product
//             await Wishlist.findOneAndUpdate(
//                 { userId: userId },
//                 { $push: { products: { productId: productId } } }
//             );
//         }

//         // Send a success response
//         res.status(200).json({ success: true });
//     } catch (error) {
//         console.error('Error:', error);
//         // Send an error response
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };



const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id; // Assuming you're using session-based authentication
        const productId = req.body.id;
        console.log("productId : ",productId);
        await Wishlist.findByIdAndDelete(productId)

        // Remove the product from the wishlist
    

        // Send a success response
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        // Send an error response
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const addtowishlistfromhome=async(req,res)=>{
    try {
        const {productId,size}=req.body
        console.log([productId,size]);
        const userId=req.session.user_id;
        const userIdObjectId = new mongoose.Types.ObjectId(userId);
        const productObjectId = new mongoose.Types.ObjectId(productId);
        const wishlistData  = await Wishlist.create({
            userId:userIdObjectId,
            products:productObjectId,
            quantity:Number(1),
            size:size
        })

        console.log("wishlistData : ",wishlistData);
        res.status(200).json({message:'product added to wishlist'})
    } catch (error) {
       console.log(error.message); 
    }
}


const addcartfromwishlist = async(req,res)=>{
    try {
         const userId = req.session.user_id; // Assuming you're using session-based authentication
    const productId = req.body.id;
    console.log("productId : ",productId);
    const wishlistData=await Wishlist.findById(productId);
   const quantity=wishlistData.quantity;
   
   const size=wishlistData.size
    const cartData = await Cart.create({
        userId:userId,
        products:[],
       
       
    });
    cartData.products.push({productId,quantity,size});

   await cartData.save();
    console.log("fcgvhjkl : ",cartData);
        
    } catch (error) {
        
    }
}

module.exports={
    loadwishlist,
    removeFromWishlist,
    addtowishlistfromhome,
    addcartfromwishlist
}