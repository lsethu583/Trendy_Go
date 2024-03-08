
const Products =require('../../models/productModel')
const Category=require('../../models/categoryModel')
const User=require('../../models/userModel')
const Orders=require('../../models/orderSchema')
const {orderIdGenerate}=require('../../helper/idgenerate')





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
       console.log(orderId);
        const orders=await Orders.findById(orderId).populate('products.productId').populate('userId')
        console.log(orders);
        
        res.render('orderdetail',{orders:orders})
    } catch (error) {
        console.log(error.message);
    }
}

const orderstatusupdate = async (req, res) => {
    try {
        const orderId = req.query.OID;
        const newStatus = req.body.orderStatus;

        const result = await Orders.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        );

        // if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
        //     await User.findByIdAndUpdate(
        //         order.userId,
        //         { $inc: { wallet: order.discountedAmount } },
        //         );
        //         order.paymentStatus = 'Refunded';
        //         await order.save()     
        // }

        const order = await Orders.findById(orderId);

        // Fetch the order details with populated fields
        const orders = await Orders.findById(orderId)
            .populate('products.productId')
            .populate('userId');

        // Render the template with the orders variable
        res.render('orderdetail', { orders: orders, msg: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
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

module.exports={
    loadOrderList,
    loadOrderDetails,
    orderstatusupdate,
    cancelorder,

}