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
    console.log("productidssss: ", productIds);
    console.log("productNumbersssss", productNumbers);
    let totalSale = await Orders.countDocuments();
    console.log("total sale : ",totalSale);


    const products = await Product.find({ _id: { $in: productIds } });
    
    const productNames = products.map(product => product.product_name);
    const productCategories = products.map(product => product.productCategory);
    console.log("productCategories : ",productCategories);
    let result = [];
    for(let item of productCategories){
      result.push(await category.findById(item))
      
    }
    console.log("results : ",result);
    let categoryNamesofOrder = result.map(cat =>cat.categoryName);
    console.log("categoryNamesofOrder : ",categoryNamesofOrder);
    const categories = await category.find({ _id: { $in: productCategories } });
    console.log("categories : ",categories);

 
    const categoryNames = categories.map(category => category.categoryName);
    console.log("productNames :", productNames);

console.log("categoryNames :", categoryNames);

    // if (productName) {
    //     productCountsWithNames[productName] = productCounts[productId];
    // } else {
    //     console.log(`Product name not found for product ID: ${productId}`);
    // }

    console.log("productCounts: ", productCounts);
    let data4 = Object.values(productCounts)
   
    // console.log("array :", array);
    // console.log("ordersssss : " ,orders);
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
      
      // Count orders by date
      const ordersCount = countOrdersByDate(orders);
      
      // Create an object to store date key-value pairs
      const ordersByDateObject = {};
      
      // Store date key-value pairs in the object
      for (const dateKey in ordersCount) {
        ordersByDateObject[dateKey] = ordersCount[dateKey];
      }
      
      // Display the object containing date key-value pairs
      console.log(ordersByDateObject);


      res.status(200).json({data:ordersByDateObject,data1:productNumbers,data2:productNames,data3:categoryNamesofOrder,data4:data4})
}




module.exports={
    loadchart,
}