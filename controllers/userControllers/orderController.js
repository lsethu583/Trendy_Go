const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const Category=require("../../models/categoryModel")
const Address=require('../../models/adress')
const Orders=require('../../models/orderSchema')
const {orderIdGenerate}=require('../../helper/idgenerate')



const loadCheckoutPage=async(req,res)=>{
    try {
        const userId=req.session.user_id;
        let  address = await Address.findOne({userID:userId})
        let addresses
        if(address){
             addresses = address.address
        }else{
             addresses =[]
        }
       
        const cart=await Cart.findOne({userId:userId}).populate('products.productId')
       
       
        res.render('user/checkout',{addresses,cart})
    } catch (error) {
       console.log(error.message); 
    }
}
const placeorder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        
        const { addressId, totalAmount, paymentMethod} = req.body;
        const address = await Address.findOne({userID: userId});
        const selectedAddress = address.address.find((item) => item._id.toString() === addressId);
        const userCart = await Cart.findOne({userId: userId});
        
        // Create the order
        const order = new Orders({
            orderId:orderIdGenerate(),
            userId: userId,
            address: selectedAddress, // Assuming addressId is the address object
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            products: userCart.products
        });

        // Save the order to the database
        await order.save();
        const cartData = await Cart.findOneAndUpdate({ userId: userId });
        const products = await Product.find({is_Listed:true});


        const productIds = cartData.products.map(prod => prod._id);
        console.log(productIds);
       for (const product of userCart.products) {
    // Iterate over each product in the cart
    const productId = product.productId;
    const selectedProduct = await Product.findById(productId);

    // Find the index of the size variant to update
    const sizeIndex = selectedProduct.sizes.findIndex(size => size.size === product.size);

    // If size variant exists, update its quantity
    if (sizeIndex !== -1) {
        selectedProduct.sizes[sizeIndex].quantity -= product.quantity;
        await selectedProduct.save();
    } else {
        console.log(`Size variant not found for product ID: ${productId} and size: ${product.size}`);
    }
}

        // Clear the cart after placing the order
      cartData.products = [];
      await cartData.save()
        

        // Send a success response
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}






module.exports={
loadCheckoutPage,
placeorder,

}