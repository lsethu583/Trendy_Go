const User=require('../../models/userModel')
const Products=require('../../models/productModel')
const Category=require('../../models/categoryModel')

const categorySort=async(req,res)=>{
    try {
     
        const userId=req.session.user_id;
        
        const category=req.query.category;
        
        const myCategory = await Category.findById(category);
       
      
        const products=await Products.find({}).populate('productCategory');
     
        const selectedProduct = products.filter(product => product.productCategory.categoryName === myCategory.categoryName);
        
        
       
        res.render("user/categorysort",{user:userId,category:myCategory,products:selectedProduct});
    } catch (error) {
        console.log(error.message);
    }
}

const lowToHigh = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const categoryId = req.query.category; 
      

       
        const products = await Products.find({ productCategory: categoryId }).sort({ discount_price: 1 });
        

        const categoryData = await Category.find({ is_Listed: true });

        res.render("user/categorysort", { user: userId, category: categoryData, products: products });
    } catch (error) {
        console.log(error, "lowToHigh page error");
    }
}


const HighToLow =  async(req,res)=>{
    try{
        
       
        const userId = req.session.user_id;
        const categoryId = req.query.category; 
       
        
        const products = await Products.find({ productCategory: categoryId }).sort({ discount_price: -1 });
        
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
        const categoryId = req.query.category; 
        const products = await Products.find({ productCategory: categoryId }).sort({ product_name: 1 });
     
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
        const categoryId = req.query.category; 
        const products = await Products.find({ productCategory: categoryId }).sort({ product_name: -1 });
        const categoryData = await Category.find({is_Listed:true});
       
            res.render("user/categorysort",{user:userId,category:categoryData,products:products});


    }
    catch(error){
        console.log(error,"lowToHigh page error");
    }
}

const sorting=async (req, res) => {
    try {
        const userId = req.session.user_id;
        const categoryData = await Category.find({is_Listed:true});
        const { start, end } = req.query;
       

        
        const startPrice = parseInt(start);
        const endPrice = parseInt(end);

        const products = await Products.find({
            discount_price: { $gte: startPrice, $lte: endPrice }
        });
        
      
        res.render("user/categorysort",{user:userId,category:categoryData,products:products});
    } catch (err) {
        
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const searchProducts = async(req,res)=>{
    try{
       
        const {searchDataValue} = req.body
        
        const searchProducts = await Products.find({product_name:{
            $regex: searchDataValue , $options: 'i'
        }})
       
        res.json({status:"searched",searchProducts})

    }catch(err){
        console.log(err);
    }
 }

 const productList = async(req,res)=>{
    try{
      const productId = req.query._id
      req.session.productId = productId
      const Product = await Products.findOne({_id:productId}).populate('productCategory')
      const categories = await Category.find({is_Listed:true})
      
     
      res.render('user/userproductdetails',{Product,categories,})
    }catch(err){
        console.log(err.message)
    }
}




module.exports={
    categorySort,
    lowToHigh,
    HighToLow,
    AtoZ,
    ZtoA,
    sorting,
    searchProducts,
    productList
}