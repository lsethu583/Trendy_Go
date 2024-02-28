const User = require('../models/userModel')

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            next()
        }
        else{
            res.redirect('/login')
        }
        
        
    } catch (error) {
        console.log(error.message)
    }
}
const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/')
        }else{
            
            
            next()

        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const isBlocked = async (req,res,next)=>{
    try {
        const userId = req.session.user_id
        const user   = await User.findById(userId)
        if(user.isActive){
            next()
        }else{
            req.session.user_id=null
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    isLogin,
    isLogout,
    isBlocked
}