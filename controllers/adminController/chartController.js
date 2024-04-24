const Product=require('../../models/productModel')
const user=require('../../models/userModel')

const category=require('../../models/categoryModel')
const Orders = require('../../models/orderSchema')
const { response } = require('../../routes/adminRoute')


const loadchart=async(req,res)=>{
    let array=[]
    const orders=await Orders.find({});
    orders.forEach(order=>{
        order.products.forEach(productId=>{
            array.push(productId)

        })
    })
    const productCounts = array.reduce((acc, curr) => {
        const productId = curr.productId.toString(); // Convert ObjectId to string for comparison
        if (acc[productId]) {
            acc[productId]++;
        } else {
            acc[productId] = 1;
        }
        return acc;
    }, {});

    let productIds= Object.keys(productCounts);
    let productNumbers=Object.values(productCounts)
   
    let totalSale = await Orders.countDocuments();
   


    const products = await Product.find({ _id: { $in: productIds } });
    
    const productNames = products.map(product => product.product_name);
    const productCategories = products.map(product => product.productCategory);
   
    let result = [];
    for(let item of productCategories){
      result.push(await category.findById(item))
      
    }
   
    let categoryNamesofOrder = result.map(cat =>cat.categoryName);
   
    const categories = await category.find({ _id: { $in: productCategories } });
  

 
    const categoryNames = categories.map(category => category.categoryName);
 



    
    let data4 = Object.values(productCounts)
   
    function countOrdersByDate(orders) {
        const ordersCount = {};
      
        orders.forEach(order => {
          const dateKey = order.orderDate.toDateString();
      
          if (ordersCount[dateKey]) {
            ordersCount[dateKey]++;
          } else {
            ordersCount[dateKey] = 1;
          }
        });
      
        return ordersCount;
      }
      
     
      function countOrdersByDate(orders) {
        const ordersCount = {};
      
        orders.forEach(order => {
          const dateKey = order.orderDate.toDateString();
      
          if (ordersCount[dateKey]) {
            ordersCount[dateKey]++;
          } else {
            ordersCount[dateKey] = 1;
          }
        });
      
        return ordersCount;
      }
      
      
      const ordersCount = countOrdersByDate(orders);
      
      
      const ordersByDateObject = {};
      
     
      for (const dateKey in ordersCount) {
        ordersByDateObject[dateKey] = ordersCount[dateKey];
      }
      
     

      res.status(200).json({data:ordersByDateObject,data1:productNumbers,data2:productNames,data3:categoryNamesofOrder,data4:data4})
}




module.exports={
    loadchart,
}