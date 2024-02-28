
const Products =require('../../models/productModel')
const Category=require('../../models/categoryModel')
const User=require('../../models/userModel')
const Orders=require('../../models/orderSchema')





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
        const orderID=req.query.id
        console.log(orderID);

        const orders=await Orders.findById(orderID).populate('products.productId').populate('userId')
        
        res.render('orderdetail',{orders:orders})
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    loadOrderList,
    loadOrderDetails
}