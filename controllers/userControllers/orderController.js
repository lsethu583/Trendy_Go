const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const Category=require("../../models/categoryModel")
const Address=require('../../models/adress')
const Orders=require('../../models/orderSchema')
const wishlist=require('../../models/wishlistSchema')
const Coupon=require('../../models/couponSchema')
const {orderIdGenerate}=require('../../helper/idgenerate')
require('dotenv').config();


const crypto = require("crypto");

const Razorpay=require('razorpay')
var instance = new Razorpay({
    key_id: process.env.YOUR_KEY_ID,
    key_secret: process.env.YOUR_KEY_SECRET
});



const loadCheckoutPage=async(req,res)=>{
    try {
        const userId=req.session.user_id;
        const coupon=await Coupon.find({})
        let  address = await Address.findOne({userID:userId})
        let addresses
        if(address){
             addresses = address.address
        }else{
             addresses =[]
        }
       
        const cart=await Cart.findOne({userId:userId}).populate('products.productId')
       
       
        res.render('user/checkout',{addresses,cart,coupon})
    } catch (error) {
       console.log(error.message); 
    }
}

const placeorder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { addressId, totalAmount, paymentMethod, wallet, productId, productsize, productqty } = req.body;

        const address = await Address.findOne({ userID: userId });
        const selectedAddress = address.address.find((item) => item._id.toString() === addressId);
        const userCart = await Cart.findOne({ userId: userId });
        const product = await Product.findById(productId);
        const coupon =await Coupon.find({})

        if (!product) {
            console.error("Product not found.");
            return res.status(404).json({ error: "Product not found" });
        }

        const orderProducts = [{
            productId: product._id,
            quantity: productqty,
            size: productsize
        }];

        const order = new Orders({
            orderId: orderIdGenerate(),
            userId: userId,
            address: selectedAddress,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
        
            products: orderProducts,
            userwallet: wallet,
            coupon:coupon
        });

    

         if(paymentMethod === 'Cash On Delivery'){
            orderMethod = "cod";
            order.paymentStatus="Pending"

        }

        order.paymentMethod = orderMethod;
      
        await order.save();

        console.log("order : ", order);

        for (const product of userCart.products) {
            const selectedProduct = await Product.findById(product.productId);
            const sizeIndex = selectedProduct.sizes.findIndex(size => size.size === product.size);

            if (sizeIndex !== -1) {
                selectedProduct.sizes[sizeIndex].quantity -= product.quantity;
                await selectedProduct.save();
            } else {
                console.log(`Size variant not found for product ID: ${product.productId} and size: ${product.size}`);
            }
        }

        userCart.products = [];
        await userCart.save();

        res.status(200).json({ message: "Order placed successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}




const placeorderonline=async(req,res)=>{
    try {
        console.log("here i am here")
        const userId = req.session.user_id;
      
        const { addressId, totalAmount, paymentMethod, productId, productsize, productqty } = req.body;

        const address = await Address.findOne({ userID: userId });
        const selectedAddress = address.address.find((item) => item._id.toString() === addressId);
        const userCart = await Cart.findOne({ userId: userId });
        const product = await Product.findById(productId);
        const coupon =await Coupon.find({})
        console.log("coupon:", coupon);
        if (!product) {
            console.error("Product not found.");
            return res.status(404).json({ error: "Product not found" });
        }
    
        const orderProducts = [{
            productId: product._id,
            quantity: productqty,
            size: productsize
        }];

        const order = new Orders({
            orderId: orderIdGenerate(),
            userId: userId,
            address: selectedAddress,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
        
            products: orderProducts,
           
            coupon:coupon
        });

        if(paymentMethod === 'online payment'){
            orderMethod = "online";
            order.paymentStatus="Success"
            order.paymentMethod = orderMethod;
      
            await order.save();

            
        for (const product of userCart.products) {
            const selectedProduct = await Product.findById(product.productId);
            const sizeIndex = selectedProduct.sizes.findIndex(size => size.size === product.size);

            if (sizeIndex !== -1) {
                selectedProduct.sizes[sizeIndex].quantity -= product.quantity;
                await selectedProduct.save();
            } else {
                console.log(`Size variant not found for product ID: ${product.productId} and size: ${product.size}`);
            }
        }

        userCart.products = [];
        await userCart.save();

            const options = {
                amount: totalAmount * 100,
                currency: 'INR',
                receipt: order.orderId,

            };

            instance.orders.create(options, async function (err, order) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Failed to create Razorpay order" });
                    return;
                } else {

                    

                     res.json({ payment: false, method: "UPI", razorpayOrder: order,order:order,coupon:coupon});
                }
            });

        }



    } catch (error) {
        console.log(error.message);
    }
}



const verifyRazorpay=async(req,res)=>{
    try {
        const { order, payment } = req.body;
       
        
        res.status(200).json({ status: true,  })
        let hmac = crypto.createHmac("sha256", YOUR_KEY_SECRET);
        hmac.update(
            `${payment.razorpay_order_id}|${payment.razorpay_payment_id}`
        );
        hmac = hmac.digest("hex");
        if (hmac === payment.razorpay_signature) {
            
           
             
            res.status(200).json({ status: true,  })
           

        } else {
           
            res.json({ status: false })
        }


        
    } catch (error) {
        
    }
}



const loadorderdetails=async(req,res)=>{
    try {
        const orderId=req.query.OID;
        const userId=req.session.user_id
        const user=await User.findById(req.session.user_id)
        const cart = await Cart.find({ userId: userId }).populate('products.productId');
        const orders=await Orders.find({userId:userId}).populate('products.productId').populate('userId');

       
        res.render('user/getorderdetails',{orderId,userId,user,cart,orders})
    } catch (error) {
        console.log(error.message);
    }
}

const userCancel = async (req, res) => {
    try {
        const orderId = req.query.OID
        const userId = req.session.user_id
        const newStatus = 'Cancelled'
        const result = await Orders.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('productId');
        const orders = await Orders.findById(orderId)
            .populate('products.productId')
            .populate('userId');
            if (orders.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
                await User.findByIdAndUpdate(
                    orders.userId,
                    { $inc: { wallet: orders.discountedAmount } },
                    );
               orders.paymentStatus = 'Refunded';
               await orders.save()     
            }
        res.render('user/getorderdetail', { user, category, cart, order })
    } catch (error) {
       console.log(error.message);
    }
}

const userReturnOrder = async (req, res) => {
    try {
        const orderId = req.query.OID
        const userId = req.session.user_id

        const newStatus = 'Returned'
        const result = await Orders.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )


        const order = await Orders.findById(orderId)
        const user = await User.findById(req.session.userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('productId');
        if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
            const updatedUser = await User.findByIdAndUpdate(
                order.userId,
                {
                    $inc: { wallet: order.discountedAmount },
                   
                }
            );
        
            order.paymentStatus = 'Refunded';
               await order.save()     
        }
        
        const orders = await Orders.findById(orderId)
            .populate('products.productId')
            .populate('userId');

           
        res.render('user/getorderdetail', { user, category, cart, order:orders})
    } catch (error) {
        console.log(error.message);
    }
}


        const applyCoupon = async (req, res) => {
            try {
                const { user_id } = req.session; // Assuming userId is stored in session
                
                const cart = await Cart.find({ userId: user_id })
                const totalAmount=req.body.totalAmount
                
                const {code} = req.body;
               
                // Find the coupon in the database
                const coupon = await Coupon.findOne({ name: code });
                
        
                if (!coupon) {
                    return res.status(404).json({ success: false, message: "Coupon not found" });
                }
        
                // Check if the coupon is already used by the user
                if (coupon.usedByUsers.includes(user_id)) {
                    return res.status(400).json({ success: false, message: "Coupon already used" });
                }
        
                // Check if the current date is within the coupon validity period
                const currentDate = new Date();
                if (currentDate < new Date(coupon.start) || currentDate > new Date(coupon.end)) {
                    return res.status(400).json({ success: false, message: "Coupon expired" });
                }
        
                // Check if the total amount is greater than the purchase amount required for the coupon
                if (totalAmount < coupon.purchaseamount) {
                    return res.status(400).json({ success: false, message: "Minimum purchase amount not reached" });
                }
        
                // Apply the discount
                const discountedAmount = Number(totalAmount) - Number(coupon.discount) ;
                let couponDiscount = coupon.discount
                
                // Mark the coupon as used by the user
                coupon.usedByUsers.push(user_id);
                await coupon.save();
        
                // Return the updated total amount after applying the discount
                return res.status(200).json({ success: true, totalAmount: discountedAmount , discount:couponDiscount });
            } catch (error) {
                console.error("Error applying coupon:", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };


        const orderSuccess=async(req,res)=>{
            try {
                res.render('user/orderSuccess')
                
            } catch (error) {
                
            }
        }
        

module.exports={
loadCheckoutPage,
placeorder,
loadorderdetails,
userCancel,
userReturnOrder,
applyCoupon,
placeorderonline,
verifyRazorpay,
orderSuccess

}