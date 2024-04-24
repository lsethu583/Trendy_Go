const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const Category=require("../../models/categoryModel")
const Address=require('../../models/adress')
const Orders=require('../../models/orderSchema')
const wishlist=require('../../models/wishlistSchema')
const Coupon=require('../../models/couponSchema')
const Wallet=require('../../models/walletSchema')
const {orderIdGenerate}=require('../../helper/idgenerate')
require('dotenv').config();


const crypto = require("crypto");
const {YOUR_KEY_ID,YOUR_KEY_SECRET} = process.env;

const Razorpay=require('razorpay')
var instance = new Razorpay({
    key_id: YOUR_KEY_ID,
    key_secret: YOUR_KEY_SECRET
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

    

        if (paymentMethod === 'Cash On Delivery') {
            if (totalAmount > 1000) {
                console.log("COD is not possible on orders above 1000")
                 res.json({ message: "COD is not possible on orders above 1000" });
            } else {
                orderMethod = "cod";
                order.paymentStatus = "Pending";
            
        

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

        res.status(200).json({ message: "Order placed successfully" });
    }
    }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}




const placeorderonline=async(req,res)=>{
    try {
       
        const userId = req.session.user_id;
      
        const { addressId, totalAmount, paymentMethod, productId, productsize, productqty } = req.body;

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

        const onlineorder = new Orders({
            orderId: orderIdGenerate(),
            userId: userId,
            address: selectedAddress,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            products: orderProducts,
            coupon:coupon
        })

        if(paymentMethod === 'online payment'){
            orderMethod = "online";
            onlineorder.paymentStatus="Success"
            onlineorder.paymentMethod = orderMethod;
      
            await onlineorder.save();
            let orderid= onlineorder._id
           

            
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
                receipt: onlineorder.orderId,

            };

            instance.orders.create(options, async function (err, order) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Failed to create Razorpay order" });
                    return;
                } else {

                    

                     res.json({ payment: false, method: "UPI", razorpayOrder: order,order:orderid,coupon:coupon});
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
        const orders=await Orders.findOne({orderId}).populate('products.productId').populate('userId');
        console.log("orders : : : : :  : ",orders);
    
        
        const coupon=await Coupon.find({})
       
        res.render('user/getorderdetails',{orderId,userId,user,cart,orders,coupon})
    } catch (error) {
        console.log(error.message);
    }
}



const deleteOrder = async(req,res)=>{
    try{
    const userId = req.session.user_id;
    const userCart = await Cart.findOne({ userId: userId });
    const {id,size,quantity} = req.body;
   
    
    const findOrder =  await Orders.findOne({_id:id})
   
   
        let updateOrder = await Orders.findOneAndUpdate({_id:id},{
            $set:{
                orderStatus:'Cancelled'
            }
        })
        

        let productSet = []

        updateOrder.products.forEach(element =>{
            let productStore = {
                productId:element.productId,
                quantity:element.quantity,
                size:element.size
            }

            productSet.push(productStore)
          

            })

           
            for (const product of updateOrder.products) {
                const selectedProduct = await Product.findById(product.productId);
                
                const sizeIndex = selectedProduct.sizes.findIndex(size => size.size === product.size);
    
                if (sizeIndex !== -1) {
                    selectedProduct.sizes[sizeIndex].quantity += product.quantity;
                    await selectedProduct.save();
                } else {
                    console.log(`Size variant not found for product ID: ${product.productId} and size: ${product.size}`);
                }
            }

            if(updateOrder.paymentMethod === 'online'){
            const wallet=await Wallet.find({user:userId});
            
            if(wallet){
               
                await Wallet.findOneAndUpdate({user:userId},{$push:{transactions:{tamount:findOrder.totalAmount,tid:orderIdGenerate()}},$inc:{walletAmount:findOrder.totalAmount}})
            }
        }
           
            res.status(200).json({ success:true});

    }catch(err){
        console.log(err.message);
    }
    }

    const returnOrder = async(req,res)=>{
        try {
            
            const orderID = req.body.orderID
            const {size,quantity}=req.body;
            const userId=req.session.user_id;
           
           
            const order = await Orders.findByIdAndUpdate({_id:orderID},
                {$set:{
                    orderStatus:"Return Processing"
                }})

             
    
            if(order.orderStatus =="Returned"){
                let productArray = []
                order.products.forEach(element =>{
                    let productData = {
                        productID:element.productId,
                        quantity:element.quantity,
                        size:element.size
                    }
                    productArray.push(productData)
                })
                


                for (const product of order.products) {
                    const selectedProduct = await Product.findById(product.productId);
                    
                    const sizeIndex = selectedProduct.sizes.findIndex(size => size.size === product.size);
        
                    if (sizeIndex !== -1) {
                        selectedProduct.sizes[sizeIndex].quantity += product.quantity;
                        await selectedProduct.save();
                    } else {
                        console.log(`Size variant not found for product ID: ${product.productId} and size: ${product.size}`);
                    }
                }
               
        }
           
            res.status(200).json({ success:true});

    }catch(err){
        console.log(err.message);
    }
    }


    const cancelReturn = async(req,res)=>{
        try {
            const orderId = req.body.orderID
           
            const order = await Orders.findByIdAndUpdate({_id:orderId},{$set:{orderStatus:"Delivered"}})
            res.status(200).json({success:true})
        } catch (error) {
            console.log(error.message);
        }
    }

        const applyCoupon = async (req, res) => {
            try {
                const { user_id } = req.session; 
                
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
        


        const onlinepaymentfailed = async(req,res)=>{
            try {
                let order = req.body.order;
             
                const orderData = await Orders.findById(order);
               
                orderData.orderStatus="Payment Pending";
                orderData.paymentStatus="Payment Failed";
                orderData.save();
                res.status(200).json({})
              

                
               
                
            } catch (error) {
                
            }
        }
        

        const repayment=async(req,res)=>{
            try {
                const orderId=req.query.id;
               
                const orderData= await Orders.findById(orderId).populate('products.productId');

            
               
                res.render('user/repayment',{order:orderData})
                
            } catch (error) {
               console.log(error); 
            }
        }

         
const postRepaymentData = async(req,res)=>{
    try{
        const orderid = req.body.orderId;
        const newOrderPayment = req.body.paymentMethod
        const orderData = await Orders.findById(orderid);
        
   

       
        if(newOrderPayment === "Cash on Delivery"){

            orderData.orderStatus="Order Placed";
            orderData.paymentStatus="Success";
        await orderData.save();
        res.status(200).json({message:"order placed successfully"})
     

    }
    else if(newOrderPayment === "online"){


        orderData.orderStatus="Order Placed";
        orderData.paymentStatus="Success";
    await orderData.save();
        
    const options = {
        amount: orderData.totalAmount * 100,
        currency: 'INR',
        receipt: orderData.orderId,

    };

    instance.orders.create(options, async function (err, order) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to create Razorpay order" });
            return;
        } else {

            

             res.json({ payment: false, method: "UPI", razorpayOrder: order,order:orderid});
        }
        });

    }
        
       

    }
    catch(error){
        console.log("postRepaymentData page error : ",error);
    }
}


module.exports={
loadCheckoutPage,
placeorder,
loadorderdetails,
deleteOrder,
returnOrder,
cancelReturn,
applyCoupon,
placeorderonline,
verifyRazorpay,
orderSuccess,
onlinepaymentfailed,
repayment,
postRepaymentData

}