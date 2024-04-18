const Coupon =require('../../models/couponSchema')
const User = require('../../models/userModel')
const moment = require("moment");

const getcouponpage = async (req,res)=>{
    try {

        const page = req.query.page || 1;
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        const couponCount = await User.countDocuments({});
        totalPages = Math.ceil(couponCount/pageSize);
        const coupons = await Coupon.find({isList:true}).skip(skip).limit(pageSize);
        res.render('coupon',{coupons,totalPages,currentPage:page,})
        
    } catch (error) {
        console.log("getcouponpage page error : ",error.message);
    }
}



const postcoupondata = async(req,res)=>{
    try {
        const { name, discount, purchase, start, end } = req.body;
        
        const data = {
            couponName: name,
            startDate: new Date(start + 'T00:00:00'),
            endDate: new Date(end + 'T00:00:00'),
            minimumPurchase: purchase,
            discount: discount
        }

        const couponData = await Coupon.create({
            name: data.couponName,
            discount: data.discount,
            purchaseamount: data.minimumPurchase,
            start: data.startDate,
            end: data.endDate
        })

        res.redirect("coupon")
        
    } catch (error) {
        
    }
}

const deletecoupon = async(req,res)=>{
    try {
        const couponID = req.query.id; 
        await Coupon.findByIdAndDelete(couponID);
        res.status(200).json({ success: true });
        
    } catch (error) {
        
    }
}


const showfilteredcoupon = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        const couponCount = await User.countDocuments({});
        totalPages = Math.ceil(couponCount/pageSize);
        const coupons = await Coupon.find({isList:true}).skip(skip).limit(pageSize);


        
        const dateString = req.body.date;
       
        console.log("dateString : ", dateString);

        if (dateString !== undefined) {
            // Assuming dateString is in the format 'YYYY-MM-DD'
            let parts = dateString.split("-");
            let reversedDate = parts[2] + "-" + parts[1] + "-" + parts[0];
            
            // Use moment.js to parse and format the date
            const formattedDate = moment(reversedDate, 'DD-MM-YYYY').toDate();
        
            const couponCreated = await Coupon.find({ isList: true });
            
            // Filter coupons created on the provided date
            const couponData = couponCreated.filter(coupon => {
                // Assuming coupon.end is the date when the coupon was created
                return moment(coupon.start).startOf('day').toDate() <= formattedDate &&
                       moment(coupon.end).endOf('day').toDate() >= formattedDate;
            });
        
            console.log("couponData", couponData);
        
            return res.render("coupon", { coupons: couponData ,totalPages,currentPage:page}); 
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

// const searchCoupon = async (req, res) => {
//     try {

//         const page = req.query.page || 1;
//         const pageSize = 5;
//         const skip = (page - 1) * pageSize;
//         const couponCount = await User.countDocuments({});
//         totalPages = Math.ceil(couponCount/pageSize);
        
//         const searchQuery = req.body.search;
//         if (!searchQuery) {
//             return res.render("coupon", { alertMessage: "Please enter a name to search coupons.", coupons: [] });
//         }
        
//         // Assuming your Coupon model is named Coupon
//         const coupons = await Coupon.find({ name: { $regex: searchQuery, $options: 'i' } }).skip(skip).limit(pageSize);

//         return res.render("coupon", { coupons: coupons,totalPages,currentPage:page}); // Render the coupon page with filtered results
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).send("Internal Server Error");
//     }
// };


module.exports={
    getcouponpage,
    postcoupondata,
    deletecoupon,
    showfilteredcoupon,
    
}