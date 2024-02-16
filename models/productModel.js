const mongoose = require ('mongoose')

const productSchema = mongoose.Schema({
    product_name : {
        type : String,
        require : true
    },
    price : {
        type : Number,
        require : true
    },
    discount_price:{
        type:Number,
        required:true
    },
    stock : {
        type : Number,
        require : true
    },
    description : {
        type : String,
        require : true
    },
    fullDescription:{
        type:String,
    },
    image:[{
        type:String,
        required:true
    }],
    productCategory : {
        type :mongoose.Schema.Types.ObjectId,
        ref:'Category',
        require : true
    },
    is_Listed : {
        type : Boolean, 
        default : true
    },
    rating:{
        type:Number
    },
    reviews: [
        {
            comment: {
                type: String,
                required: false
            },
            rating: {
                type: Number,
                required:false
            },
            customerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User' 
            },
            date:{
                type:Date,
                default:Date.now
            }
        }
    ],
    sizes:[
        {
            size:{
                type:String,
                required:true
            },
            quantity:{
                type:Number,
                required:true
            }
        }
    ],
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('Product',productSchema) 