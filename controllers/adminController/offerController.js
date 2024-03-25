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
        console.log(req.body.category);
        const product=await Product.find().populate("productCategory")
        const existingOffer = await Offer.findOne({ category : category});
        if (existingOffer) {
            return res.status(200).json({ message: "Offer already added in this category" });
        }else{
            const offerData=await Offer.create({
            category:category,
            discount:discount,
            purchaseamount:purchase,
            start:start,
            end:end
        })
        
        
        res.status(200).json({msg:"success"})
            }
            const offerCategory=await Category.findOne({categoryName:category})
            console.log("offerCategory",offerCategory);
            const offer = await Offer.findOne({ category: category });
            
            

            const offerProducts = await Product.find({ 
                price: { $gte: purchase }, 
                productCategory: offerCategory._id
            });


for (const product of offerProducts) {
    
    const offerPrice = product.price - discount;

    product.offerPrice = offerPrice;

    await product.save();
    
}


        
    } catch (error) {
      console.log(error.message);  
    }
}




const deleteOffer=async(req,res)=>{
    try {
        const id=req.query.id;
        
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