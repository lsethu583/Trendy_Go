const Products =require('../models/productModel')
const Category=require('../models/categoryModel')
const User=require('../models/userModel')
const path=require('path')
const sharp=require('sharp')


//loading the products page and thereby products
const loadProducts=async(req,res)=>{
    
    try {
       
        const product=await Products.find({}).populate('productCategory')
        const category=await Category.find({})
        res.render('products',{category,product})
    } catch (error) {
        console.log(error.message);
    }
}

//the page that shows form for adding product
const loadProductForm=async(req,res)=>{
    try {
      const userData=await User.findById({_id:req.session.admin})  
      const category=await Category.find({})
      res.render('addProducts',{category,admin:userData})
    } catch (error) {
        console.log(error.message);
    }
}

//add product in the page loadProductForm
const addProduct=async(req,res)=>{
    try {
        const imageData=[];
        const imageFiles=req.files;
        for(const file of imageFiles){
            const randomInteger=Math.floor(Math.random()*20000001);
            const imageDirectory=path.join('public','assetsb','productImages');
            const imageFileName="cropped"+randomInteger +".jpg";
            const imagePath=path.join(imageDirectory,imageFileName);
   
            const croppedImage=await sharp(file.path)
            .resize(200,200,{
                fit:"cover",
            })
            .toFile(imagePath);
            if(croppedImage){
                imageData.push(imageFileName)
            }
        }
        const sizes = [];
        const sizeS = {
            size: 'S',
            quantity: req.body.S || 0
        };
        sizes.push(sizeS);

        const sizeM = {
            size: 'M',
            quantity: req.body.M || 0
        };
        sizes.push(sizeM);

        const sizeL= {
            size: 'L',
            quantity: req.body.L|| 0
        };
        sizes.push(sizeL);

        

        const {productName,productCategory,price,description,image,discount_price}=req.body;
        console.log(sizes);
        const product=new Products({
            product_name:productName,
            productCategory,
            price,
            description,
            image:imageData,
            sizes:sizes,
            discount_price
        })
        console.log(product,'fd');

        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error occured while adding products")
    }
}

const deleteProduct=async(req,res)=>{
    try {
        const id=req.params.id;
        const productData=await Products.findByIdAndUpdate(
            {_id:id},
            {$set:{
                is_Listed:false,
            },
        }
        );
        res.redirect('/products')
    } catch (error) {
        console.log(error.message);
    }
}



//for loading page to edit the already existing products
const loadEditProductForm=async(req,res)=>{
    try {
        const id = req.query.id;
    const product = await Products.findOne({ _id: id });
    let categories = await Category.find({});
    if (product) {
      res.render("editProduct", { categories, product });
    } else {
      res.redirect("/products");
    }
    } catch (error) {
       console.log(error.message); 
    }
}

//to store the edited products
const storeEditProduct=async(req,res)=>{
    try {
        const product = await Products.findOne({ _id: req.body.product_id  });
    let images=[],deleteData=[]
    const {name,category,price,description,image,discount_price}=req.body;

    const sizes = [];
    const sizeS = {
        size: 'S',
        quantity: req.body.S || 0
    };
    sizes.push(sizeS);

    const sizeM = {
        size: 'M',
        quantity: req.body.M || 0
    };
    sizes.push(sizeM);

    const sizeL= {
        size: 'L',
        quantity: req.body.L|| 0
    };
    sizes.push(sizeL);
    if (req.body.deletecheckbox) {
   
        deleteData.push(req.body.deletecheckbox); 
       
       
        
        deleteData = deleteData.flat().map(x=>Number(x))
        
        images = product.image.filter((img, idx) => !deleteData.includes(idx));
      }else{
        images = product.image.map((img)=>{return img});
      }
      if(req.files.length!=0){
        for (const file of req.files) {
    
          const randomInteger = Math.floor(Math.random() * 20000001);
          const imageDirectory=path.join('public','assetsb','productImages');
            const imgFileName="cropped"+randomInteger +".jpg";
            const imagePath=path.join(imageDirectory,imgFileName);

            const croppedImage = await sharp(file.path)
          .resize(580, 320, {
            fit: "cover",
          })
          .toFile(imagePath);
  
        if (croppedImage) {
          images.push(imgFileName);
        }

        }
    }

    await Products.findByIdAndUpdate(
        {_id:req.body.product_id},
        {
            $set:{
            product_name:name,
            productCategory:category,
            price:price,
            sizes:sizes,
            escription:description,
            image:images,
            discount_price:discount_price,
            
            }
        }
    );
    res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);
    }
}

const isListedUnlisted=async(req,res)=>{
    try {
        
        const id = req.query.id;
        
        const product = await Products.findById(id);
        if (product) {
            // Toggle the is_Listed property
            product.is_Listed = !product.is_Listed;
            await product.save();
            res.status(200).send('success')
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}
    



module.exports={
    loadProducts,
    loadProductForm,
    addProduct,
    deleteProduct,
    loadEditProductForm,
    storeEditProduct,
    isListedUnlisted

}


