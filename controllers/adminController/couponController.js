const Coupon =require('../../models/couponSchema')
const User = require('../../models/userModel')

const getcouponpage = async (req,res)=>{
    try {
        const coupons = await Coupon.find({isList:true})
        res.render('coupon',{coupons})
        
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

module.exports={
    getcouponpage,
    postcoupondata,
    deletecoupon
}