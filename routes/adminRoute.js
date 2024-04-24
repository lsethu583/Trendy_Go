const express = require("express");
const admin_route = express();
const multer=require ("multer")
const adminController = require('../controllers/adminController/adminController');
const categoryController = require('../controllers/adminController/categoryController');
const productController=require('../controllers/adminController/productController')
const adminAuth = require('../middleware/adminAuth');
const adminOrderController=require('../controllers/adminController/adminOrderController');
const couponController = require('../controllers/adminController/couponController')
const offerController=require('../controllers/adminController/offerController')
const chartController=require('../controllers/adminController/chartController')
const salesreportcontroller=require('../controllers/adminController/salesreportcontroller')

//storage of images of category
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/assetsb/uploads') // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname) // File naming strategy
  }
});
const upload=multer({storage:storage})

//storage of images of products
const Storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null, './public/assetsb/productImages')
  },
  filename:function(req,file,cb){
    cb(null,Date.now() + '-' + file.originalname)
  }

})
const uploadProduct=multer({storage:Storage})

//storage of images of banner
const storages = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/assetsb/banner') // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname) // File naming strategy
  }
});
const uploadBanner=multer({storage:storages})

const session = require('express-session');
const config = require('../config/config');

admin_route.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');


admin_route.get('/dashboard', adminAuth.isLogin, adminController.loadDashboard);
admin_route.post('/dashboard/chart',chartController.loadchart)
admin_route.get('/userDashboard', adminAuth.isLogin, adminController.loadUserDashboard);
admin_route.get('/logout', adminAuth.isLogin, adminController.logout);


admin_route.get('/', adminAuth.isLogout, adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);
admin_route.get('/unlistUser', adminAuth.isLogin, adminController.listUser);

admin_route.get('/addCategory',adminAuth.isLogin,categoryController.loadCategoryAdd)
admin_route.get('/listCategory',adminAuth.isLogin,categoryController.loadCategoryList)
admin_route.post('/addCategory',adminAuth.isLogin,upload.single('image'),categoryController.addingNewCategory)
admin_route.get('/editCategory',adminAuth.isLogin,categoryController.editCategory)
admin_route.post('/editCategory',adminAuth.isLogin,upload.single('category_logo'),categoryController.editCategorySubmiting)
admin_route.get('/blockCategory',adminAuth.isLogin,categoryController.blockCategory)



admin_route.get('/products',adminAuth.isLogin,productController.loadProducts)
admin_route.get('/addProducts',adminAuth.isLogin,productController.loadProductForm)
admin_route.post('/addProducts',uploadProduct.array('image'),productController.addProduct)
admin_route.get('/deleteProduct/:id',adminAuth.isLogin,productController.deleteProduct)
admin_route.get('/editProduct',adminAuth.isLogin,productController.loadEditProductForm)
admin_route.post('/editProduct',adminAuth.isLogin,uploadProduct.array('image'),productController.storeEditProduct)
admin_route.get('/listUnlist',productController.isListedUnlisted)


admin_route.get('/orderlist',adminAuth.isLogin,adminOrderController.loadOrderList)
admin_route.get('/orderdetail',adminAuth.isLogin,adminOrderController.loadOrderDetails)
admin_route.get('/cancelorder',adminAuth.isLogin,adminOrderController.cancelorder);
admin_route.post('/orderdetails',adminAuth.isLogin,adminOrderController.adminchangestatus)



admin_route.get('/coupon',adminAuth.isLogin,couponController.getcouponpage);
admin_route.post('/coupon',adminAuth.isLogin,couponController.postcoupondata);
admin_route.post('/deletecoupon',adminAuth.isLogin,couponController.deletecoupon)
admin_route.post('/coupondate',adminAuth.isLogin,couponController.showfilteredcoupon)

admin_route.get('/banner', adminAuth.isLogin,adminController.loadBanner)
admin_route.post('/banner',adminAuth.isLogin,uploadBanner.array('image'),adminController.addbanner)
admin_route.get('/editbanner',adminAuth.isLogin,adminController.loadEditBannerPage)
admin_route.post('/editbanner',adminAuth.isLogin,uploadBanner.array('image'),adminController.updateBanner)

admin_route.get('/offer',adminAuth.isLogin,offerController.loadOfferPage);
admin_route.post('/offer',adminAuth.isLogin,offerController.postofferdetails)
admin_route.get('/offer/delete',adminAuth.isLogin,offerController.deleteOffer)

admin_route.get('/salesreport',adminAuth.isLogin,salesreportcontroller.getsalesreport)
admin_route.post("/salesreport/excel",adminAuth.isLogin,salesreportcontroller.excelData)
admin_route.post("/salesreport",adminAuth.isLogin,salesreportcontroller.getFilteredSalesReport);




module.exports = admin_route;
