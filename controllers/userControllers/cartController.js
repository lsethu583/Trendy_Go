const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const Category=require("../../models/categoryModel")

const loadCartPage=async(req,res)=>{
    try {
        const userId=req.session.user_id;
        const userData = await User.findById(userId);
        const categoryData = await Category.find({});

        if(req.session.user_id){
  
       // Assuming you have a function to fetch the cart for a specific user
       const userCart = await Cart.findOne({ userId: userId })
       .populate('products.productId');
   
 
   
       
   res.render('user/cart', { user: userData, category: categoryData, cart: userCart });
        }else{
           
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const addToCart=async (req,res)=>{
    try {
            const productId=req.query.id
            const size     =req.query.size
            const qty      =parseInt(req.query.qty)
            
            
        const userId=req.session.user_id;
       
        const userCart = await Cart.findOne({ userId });

        // Add the product to the cart
        userCart.products.push({ productId, qty, size });
        await userCart.save();
        
        res.redirect('/cart')
    } catch (error) {
       console.log(error.message); 
    }
}

const removeCartProduct = async (req, res) => {
    try {
        const cartId = req.query.productId;
        const userId = req.session.user_id;
        const indexOfProduct = req.query.index;

        const userCart = await Cart.findByIdAndDelete(cartId);

        res.redirect('user/cart');
    } catch (error) {
        res.redirect('/error')
    }
}

const updateQuantity = async (req, res) => {
    try {
        const { cartId, PID, newQuantity } = req.body;
        
        // Update the quantity of the specific product in the cart
        const updatedCart = await Cart.findOneAndUpdate(
            { 
                _id: cartId,
                "products._id": PID // Find the cart with given ID and the specific product ID
            },
            { 
                $set: { "products.$.quantity": newQuantity } // Update the quantity of the specific product in the cart
            },
            { new: true }
        );
        
        if (!updatedCart) {
            // If no cart was found with the given cartId or the product was not found in the cart
            return res.status(404).json({ error: 'Cart or product not found' });
        }

        // Cart updated successfully
        res.redirect('/user/cart');
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { loadCartPage, addToCart,removeCartProduct,updateQuantity};
