
const Products =require('../../models/productModel')
const Category=require('../../models/categoryModel')
const User=require('../../models/userModel')
const Orders=require('../../models/orderSchema')
const {orderIdGenerate}=require('../../helper/idgenerate')
const Wallet=require('../../models/walletSchema')





const loadOrderList = async (req, res) => {
    try {
        
       const orders=await Orders.find({}).populate('products.productId').populate('userId')
        res.render('orderlist',{orders});
    } catch (error) {
        console.log(error.message);
    }
};

const loadOrderDetails=async(req,res)=>{
    try {
        
       const orderId=req.query.orderId;
      
        const orders=await Orders.findById(orderId).populate('products.productId').populate('userId')
       
         
        
        res.render('orderdetail',{orders:orders})
    } catch (error) {
        console.log(error.message);
    }
}


const cancelorder = async (req, res) => {
    try {
        const orderId = req.query.OID;
        const newStatus = "Cancelled";

        // Update the order status to "Cancelled"
        const result = await Orders.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        );
         //  if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
        //     await User.findByIdAndUpdate(
        //         order.userId,
        //         { $inc: { wallet: order.discountedAmount } },
        //         );
        //         order.paymentStatus = 'Refunded';
        //         await order.save()     
        // }

        // Handle if the order was not found or if the status couldn't be updated
        if (result.nModified === 0) {
            return res.status(404).json({ message: "Order not found or cannot be cancelled." });
        }

        // Send a success response
        res.json({ message: "Order cancelled successfully." });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

const adminchangestatus = async (req, res) => {
    try {
      
        const userId = req.session.user_id
       
        const orderID = req.body.orderID
        const status = req.body.statusID
        const order = await Orders.findOne({ _id: orderID })
        let quantityoforders=order.products[0].quantity;
        let sizeoforders=order.products[0].size;
        
        if (order) {
            const corder = await Orders.findByIdAndUpdate({ _id: orderID },
                { $set: { orderStatus: status } }, { new: true })
              
            res.status(200).json({ success: true })
            if (corder.orderStatus == "Cancelled" || corder.orderStatus == "Returned") {
                let productarray = []
                corder.products.forEach((element) => {
                    let productdata = {
                        productid: element.productId,
                        quantityid: element.quantity,
                        size: element.size
                    }
                    productarray.push(productdata)
                })

                for (const product of corder.products) {
                    const selectedProduct = await Products.findById(product.productId);
                    
                    const sizeIndex = selectedProduct.sizes.findIndex(size => size.size === product.size);
        
                    if (sizeIndex !== -1) {
                        selectedProduct.sizes[sizeIndex].quantity += product.quantity;
                        await selectedProduct.save();
                    } else {
                        console.log(`Size variant not found for product ID: ${product.productId} and size: ${product.size}`);
                    }
                }
             
                if(corder.orderStatus == 'Returned'){
                    const userr = corder.userId
                 
                    const wallet=await Wallet.find({user:userr});
                  
                    if(wallet){
                       
                       let updatedWallet= await Wallet.findOneAndUpdate({user:userr},{$push:{transactions:{tamount:corder.totalAmount,tid:orderIdGenerate()}},$inc:{walletAmount:corder.totalAmount}})
                      
                   }
            }
        }
           
            res.status(200).json({ success:true});
        } else {
            res.status(400).json({ success: false, message: 'Failed to update status.' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadOrderList,
    loadOrderDetails,
   
    cancelorder,
    adminchangestatus
}