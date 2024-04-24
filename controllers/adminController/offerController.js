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
        let offerAmount;
        const{category,discount,start,end} = req.body;
        
        const product=await Product.find().populate("productCategory");
       
        const existingOffer = await Offer.findOne({ category : category});
        
        if (existingOffer) {
            return res.status(200).json({ message: "Offer already added in this category" });
        }else{
            const offerData=await Offer.create({
            category:category,
            discount:discount,
          
            start:start,
            end:end
        })
        
        
        res.status(200).json({msg:"success"})
            }
            const offerCategory=await Category.findOne({categoryName:category})
           
            const offer = await Offer.findOne({ category: category });
            
            

            const offerProducts = await Product.find({ 
               
                productCategory: offerCategory._id
            });


for (const product of offerProducts) {
    
    const offerPrice = Math.floor(product.price * (1 - discount / 100));
   

    product.offerPrice = offerPrice;
    product.discountApplied = true;
    offerAmount  = product.price - product.offerPrice;
  


    await product.save();
    
}


        
    } catch (error) {
      console.log(error.message);  
    }
}




const deleteOffer=async(req,res)=>{
    try {
        const id=req.query.id;
        
       let offerData = await Offer.findById(id);
     
       const offerCategory=await Category.findOne({categoryName:offerData.category});
       
       const offerProducts = await Product.find({ 
               
        productCategory: offerCategory._id
    });

    

    for (const product of offerProducts) {
    
       
        
    
        product.offerPrice = 0;
        product.discountApplied = false;
        offerAmount = 0
      
    
    
        await product.save();
        
    }

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