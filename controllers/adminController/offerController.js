const Offer=require('../../models/offerSchema')
const Category=require('../../models/categoryModel')
const Product=require('../../models/productModel')

const loadOfferPage=async(req,res)=>{
    try {
        const category= await Category.find({is_Listed: true});
        const offer=await Offer.find({ })
       
    
        res.render('offer',{category,offer})
    } catch (error) {
        console.log(error.message);
    }
}


const postofferdetails=async(req,res)=>{
    try {
        const{category,discount,purchase,start,end}=req.body;
       
        const offerData=await Offer.create({
            category:category,
            discount:discount,
            purchaseamount:purchase,
            start:start,
            end:end
        })
       res.status(200).json({msg:"success"})
    } catch (error) {
        
    }
}




const deleteOffer=async(req,res)=>{
    try {
        const id=req.query.id;
        console.log("id: " + id);
        await Offer.findByIdAndDelete(id);
        res.redirect('/admin/offer')
    } catch (error) {
        
    }
}









module.exports={
    loadOfferPage,
    postofferdetails,
    deleteOffer
    
}