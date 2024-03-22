const User=require('../../models/userModel')
const Product=require('../../models/productModel')
const Category=require('../../models/categoryModel')

const categorySort=async(req,res)=>{
    try {
        console.log("i am here");
        const userId=req.session.user_id;
        console.log(userId);
        const category=req.query.category;
        console.log(category);
        const categories = await Product.distinct('category');
        const products=await Product.find({category:category}).populate('productCategory')
        res.render("user/categorysort",{user:userId,categories: categories,category:category,products:products});
    } catch (error) {
        console.log(error.message);
    }
}

const lowToHigh =  async(req,res)=>{
    try{
        
       
        const userId = req.session.user_id;
        const products = await Product.find({}).sort({discount_price: 1});
        const categoryData = await Category.find({is_Listed:true});
        
        

            res.render("user/categorysort",{user:userId,category:categoryData,products:products});


    }
    catch(error){
        console.log(error,"lowToHigh page error");
    }
}

const HighToLow =  async(req,res)=>{
    try{
        
       
        const userId = req.session.user_id;
        const products = await Product.find({}).sort({offerprice: -1});
        const categoryData = await Category.find({is_Listed:true});
       
            res.render("user/categorysort",{user:userId,category:categoryData,products:products});


    }
    catch(error){
        console.log(error,"lowToHigh page error");
    }
}

const AtoZ =  async(req,res)=>{
    try{
        
       
        const userId = req.session.user_id;
        const products = await Product.find({}).sort({brand: 1});
        const categoryData = await Category.find({is_Listed:true});
       
            res.render("user/categorysort",{user:userId,category:categoryData,products:products});


    }
    catch(error){
        console.log(error,"lowToHigh page error");
    }
}


const ZtoA =  async(req,res)=>{
    try{
        
       
        const userId = req.session.user_id;
        const products = await Product.find({}).sort({brand: -1});
        const categoryData = await Category.find({is_Listed:true});
       
            res.render("user/categorysort",{user:userId,category:categoryData,products:products});


    }
    catch(error){
        console.log(error,"lowToHigh page error");
    }
}

const searchedData = async(req,res)=>{
    try{
        const userId = req.session.user_id;
      
        const categoryData = await Category.find({isListed:true});
        const searchedData = req.body.query;
        const regex = new RegExp('^' + searchedData, 'i');
        const searchedProducts = await Product.find({categoryData: {$regex: regex}});
        res.render("user/categorysort",{user:userId,category:categoryData,products:searchedProducts});
        

    }
    catch(error){
        console.log(error,"searchedData page error");
    }
}






module.exports={
    categorySort,
    lowToHigh,
    HighToLow,
    AtoZ,
    ZtoA,
    searchedData
}