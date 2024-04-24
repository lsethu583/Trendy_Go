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
  
      
      let arr=[]
       const userCart = await Cart.findOne({ userId: userId }).populate('products.productId')
       const modifiedProducts = userCart.products.map(item => {
        const selectedSize = item.productId.sizes.find(s => s.size === item.size);
        const cartItem = item.toObject();
        cartItem.selectedSizeQuantity = selectedSize ? selectedSize.quantity : 0;
      
         arr.push(selectedSize.quantity)
    });
       
 
   res.render('user/cart', { user: userData, category: categoryData, cart: userCart,product:products,arr });
        }else{
           
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const addToCart=async (req,res)=>{
    try {
        const productId = req.query.id;
        const size = req.query.size;
        const quantity = parseInt(req.query.qty);
        const userId = req.session.user_id;
        
        let userCart = await Cart.findOne({ userId: userId });
        
        const product = await Product.findById(productId);
        let selectedproduct = product.sizes.find(prod=>prod.size === size);

        
        const selectedSize = product.sizes.find(s => s.size === size);
        if (!selectedSize || selectedSize.quantity === 0) {
            return res.send('Out of stock');
        }
        
        if (!userCart) {
            userCart = new Cart({ userId: userId, products: [] });
        }
        
      
        const existingProductIndex = userCart.products.findIndex(item =>
            item.productId.toString() === productId && item.size === size.toString()
        );
        if (existingProductIndex !== -1) {
             if(userCart.products[existingProductIndex].quantity + quantity >selectedproduct.quantity ){
                return res.send('Out of stock');
                
             }else{
                userCart.products[existingProductIndex].quantity += quantity;
               
             }
      
           
        } else {
            
            userCart.products.push({ productId, quantity, size });
        }
        
        await userCart.save();
        res.redirect('/cart');
        
    } catch (error) {
       console.log(error.message); 
    }
}

const updateCartQuantity=async(req,res)=>{
    try{

        const {index, newQuantity } = req.body;
        const userId =req.session.user_id;
        const userCart = await Cart.findOne({userId:userId})
         userCart.products[index].quantity = newQuantity;
         userCart.save()

         res.redirect('/cart')
    } catch (error) {
        console.log(error.message);
    }
}

const removeFromCart = async (req, res) => {
    try {
        const { cartId, productId } = req.query;

       
        if (!cartId || !productId) {
            return res.status(400).json({ success: false, error: "Missing cartId or productId" });
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ success: false, error: "Cart not found" });
        }

       
        const productIndex = cart.products.findIndex(product => product._id.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ success: false, error: "Product not found in cart" });
        }

       
        cart.products.splice(productIndex, 1);
        await cart.save();

        return res.status(200).json({ success: true, message: "Product removed from cart successfully" });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};



module.exports = { loadCartPage, addToCart,removeFromCart,updateCartQuantity};
