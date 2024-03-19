const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const Category=require("../../models/categoryModel")

const loadCartPage=async(req,res)=>{
    try {
        const userId=req.session.user_id;
        const userData = await User.findById(userId);
        const categoryData = await Category.find({});
        const products = await Product.find({})

        if(req.session.user_id){
  
       // Assuming you have a function to fetch the cart for a specific user
      
       const userCart = await Cart.findOne({ userId: userId }).populate('products.productId')
       
       
    
   res.render('user/cart', { user: userData, category: categoryData, cart: userCart,product:products });
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
            const quantity =parseInt(req.query.qty)
            const userId=req.session.user_id;
      
            let userCart = await Cart.findOne({ userId:userId });

            const product = await Product.findById(productId);
            
        const selectedSize = product.sizes.find(s => s.size === size);
        if (!selectedSize || selectedSize.quantity === 0) {
            return res.send('Out of stock');
        }
        // Add the product to the cart
        if (!userCart) {
            userCart = new Cart({ userId: userId, products: [] });
        }

        
            userCart.products.push({ productId, quantity, size });
        

        // Add the product to the cart
       
        await userCart.save();

       

        
        
        res.redirect('/cart')
    } catch (error) {
       console.log(error.message); 
    }
}

const removeFromCart = async (req, res) => {
    try {
        const { cartId, productId } = req.query;

        // Validate inputs
        if (!cartId || !productId) {
            return res.status(400).json({ success: false, error: "Missing cartId or productId" });
        }

        // Find the cart by its ID
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ success: false, error: "Cart not found" });
        }

        // Find the index of the product to be removed
        const productIndex = cart.products.findIndex(product => product._id.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ success: false, error: "Product not found in cart" });
        }

        // Remove the product from the products array
        cart.products.splice(productIndex, 1);
        await cart.save();

        return res.status(200).json({ success: true, message: "Product removed from cart successfully" });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};



  
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


module.exports = { loadCartPage, addToCart,removeFromCart,updateQuantity};
