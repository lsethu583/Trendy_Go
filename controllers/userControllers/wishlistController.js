const Wishlist=require('../../models/wishlistSchema')
const Cart=require('../../models/cartModel')
const User=require('../../models/userModel')
const Products=require('../../models/productModel')
const Category=require('../../models/categoryModel')

const mongoose = require('mongoose');

const loadwishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
      

        const wishlist = await Wishlist.find({userId:userId}).populate("products")
           
        
        
           
       

        res.render('user/wishlist', { wishlist, userId });
    } catch (error) {
        console.log(error.message);
    }
};







const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.body.id;
        
        await Wishlist.findByIdAndDelete(productId)

       
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const addtowishlistfromhome=async(req,res)=>{
    try {
        const {productId,size}=req.body
       
        const userId=req.session.user_id;
        const userIdObjectId = new mongoose.Types.ObjectId(userId);
        const productObjectId = new mongoose.Types.ObjectId(productId);
        const wishlistData  = await Wishlist.create({
            userId:userIdObjectId,
            products:productObjectId,
            quantity:Number(1),
            size:size
        })

       
        res.status(200).json({message:'product added to wishlist'})
    } catch (error) {
       console.log(error.message); 
    }
}


const addcartfromwishlist = async(req,res)=>{
    try {
         const userId = req.session.user_id; 
    const productId = req.body.id;
    
    const wishlistData=await Wishlist.findById(productId);
   const quantity=wishlistData.quantity;
   
   const size=wishlistData.size
    const cartData = await Cart.create({
        userId:userId,
        products:[],
       
       
    });
    cartData.products.push({productId,quantity,size});

   await cartData.save();
    
        
    } catch (error) {
        
    }
}

module.exports={
    loadwishlist,
    removeFromWishlist,
    addtowishlistfromhome,
    addcartfromwishlist
}