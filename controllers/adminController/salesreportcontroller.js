const Orders=require('../../models/orderSchema')
const Products=require('../../models/productModel')
const Category=require('../../models/categoryModel')
const moment = require("moment");
const ExcelJS = require("exceljs")

const getsalesreport=async(req,res)=>{
    try {
        const deliveredOrders = await Orders.find({orderStatus:'Delivered'});
        
       res.render('salesreport',{deliveredOrders}) 
    } catch (error) {
      console.log(error.message);  
    }
}


const excelData = async(req,res)=>{
    try{
     
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [ 
            { header: "ORDER ID", key: "orderid", width: 25 }, 
            { header: "Customer Name", key: "name", width: 40 }, 
            { header: "Ordered Date", key: "date", width: 40 }, 
            { header: "Total Price", key: "total", width: 40 }, 
            { header: "Payment Status", key: "status", width: 40 }, 
            { header: "Payment Method", key: "method", width: 40 }, 
            ];
            const datas = req.body.salesData;
              

            datas.forEach(data => { worksheet.addRow({
                orderid : data.orderID,
                name : data.customerName,
                date : data.orderedDate,
                total : data.total,
                status : data.paymentStatus,
                method : data.paymentMethod


            });
         });

         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=salesReport.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    }
    catch(error){
        console.log("excelData page error : ",error);
    }
}

const getFilteredSalesReport = async (req, res) => {
    try {
        

        const filterOptions = req.body.selectstatus;
        const dateString = req.body.date;
       

        

        if (filterOptions !== undefined) {
          
            if (filterOptions === "Daily") {
                const today = moment().startOf('day');
                const formattedDate = today.format('DD/MM/YYYY hh:mm:ss A');
                
                const deliveredOrders = await Orders.find({orderStatus:'Delivered'});
               
                let orderData = [];
            
                for (let order of deliveredOrders) {
                    const orderDate = moment(order.orderDate, 'DD/MM/YYYY hh:mm:ss A');
                  
                    if (orderDate.isSame(today, 'day')) { 
                        orderData.push(order);
                    }
                }
            
                return res.render("salesreport", { deliveredOrders: orderData });
            }
             else if (filterOptions === "weekly") {
                let orderData = [];
                const startOfWeek = moment().startOf('week');
                const endOfWeek = moment().endOf('week');
                const formattedDate = startOfWeek.format('DD/MM/YYYY hh:mm:ss A').toString();
                const deliveredOrders = await Orders.find({orderStatus:'Delivered'});
           
                for(let order of deliveredOrders){
                    const orderDate = moment(order.orderDate, 'DD/MM/YYYY hh:mm:ss A');
                    if (orderDate.isBetween(startOfWeek, endOfWeek)) {
                        orderData.push(order);
                    }
                   

                }
                return res.render("salesreport", { deliveredOrders: orderData });
            } else if (filterOptions === "monthly") {
                let orderData = [];
                const startOfMonth = moment().startOf('month');
                const formattedDate = startOfMonth.format('DD/MM/YYYY hh:mm:ss A').toString();
                const deliveredOrders = await Orders.find({orderStatus:'Delivered'});
                for(let order of deliveredOrders){
                    const orderDate = moment(order.orderDate);
                    if (orderDate.isSameOrAfter(formattedDate, 'day')) {
                        
                        orderData.push(order);
                    }


                }

         

                return res.render("salesreport", { deliveredOrders: orderData });
            }
        } else if (dateString !== undefined) {
            // Assuming dateString is in the format 'YYYY-MM-DD'
            let parts = dateString.split("-");
            let reversedDate = parts[2] + "-" + parts[1] + "-" + parts[0];
            
            // Use moment.js to parse and format the date
            const formattedDate = moment(reversedDate, 'DD-MM-YYYY').toDate();
        
            const deliveredOrders = await Orders.find({orderStatus:'Delivered'});
           
            
            // Finding orders within the specified date range
            const orderData = deliveredOrders.filter(order => {
                return order.orderDate >= formattedDate && order.orderDate < moment(formattedDate).endOf('day').toDate();
            });
        
            return res.render("salesreport", { deliveredOrders: orderData }); 
        }
        
    } catch (error) {
        console.log("getFilteredSalesReport page error", error);
       
        res.status(500).send("Internal Server Error");
    }
}



module.exports={
    getsalesreport,
    excelData,
    getFilteredSalesReport

}