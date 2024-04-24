const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const Products=require('../../models/productModel')
const Category=require('../../models/categoryModel')
const Cart=require('../../models/cartModel')
const Address=require('../../models/adress')
const Orders=require('../../models/orderSchema');
const Coupon = require('../../models/couponSchema')
const Referal=require('../../models/referalSchema');
const Wallet = require("../../models/walletSchema");


const getProfilePage= async(req,res)=>{
    try{
        const id = req.session.user_id;
        const coupon = await Coupon.find({isList:true })
        const userDetails = await User.findById(id);
        let address=await Address.findOne({userID:id})
        const orders=await Orders.find({userId:id})
        const referalData = await Referal.findOne({owner:id});
        const wallet = await Wallet.findOne({user : id});
        
        if(address){
            address = address.address
        }
       res.render('user/profile',{user:userDetails,address:address,orders,coupon,referal:referalData , wallet})
        ;
  
    }
    catch(error){
        console.log(error,"getProfilePage  page error");
    }
  }


  const addaddress = async (req, res) => {
    try {
        const userID = req.session.user_id;
        let { addressType, name, houseName, landmark, city, state, pincode, phone, altPhone, editID } = req.body;
       
        let existingAddress = await Address.findOne({ userID: userID });
           
       
        if (editID) {
           
if (!existingAddress) {
    return res.status(404).json({ message: 'Address not found' });
}


const matchedAddressIndex = existingAddress.address.findIndex(obj => obj._id.toString() === editID);
if (matchedAddressIndex === -1) {
    return res.status(404).json({ message: 'Address with the specified ID not found' });
}

try {
    
    await Address.findOneAndUpdate(
        { 'userID': userID, 'address._id': editID },
        {
            $set: {
                'address.$.addresstype': addressType,
                'address.$.name': name,
                'address.$.housename': houseName,
                'address.$.landmark': landmark,
                'address.$.city': city,
                'address.$.state': state,
                'address.$.pincode': pincode,
                'address.$.phone': phone,
                'address.$.altphone': altPhone
            }
        }
    );

  
    
} catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'An error occurred while updating the address' });
}

        } else {
            
            if (!existingAddress) {
                existingAddress = await Address.create({
                    userID: userID,
                    address: []
                });
            }
            
            existingAddress.address.push({
                addresstype: addressType,
                name: name,
                housename: houseName,
                landmark: landmark,
                city: city,
                state: state,
                pincode: pincode,
                phone: phone,
                altphone: altPhone
            });
            await existingAddress.save();
        }

        // Send a success response
        res.redirect("/profile");
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'An error occurred while adding the address' });
    }
}

const getAddress = async (req, res) => {
    try {
        const addressID = req.params.addressID;
        const userId = req.session.user_id;
        const address = await Address.findOne({ userID: userId });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const matchedAddress = address.address.find(obj => obj._id.toString() === addressID);

        if (!matchedAddress) {
            return res.status(404).json({ message: 'Specified address not found' });
        }

        res.json(matchedAddress);
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'An error occurred while fetching the address' });
    }
}

const updateuserdetails=async(req,res)=>{
    try {
       
        const userId=req.session.user_id;
        const firstName = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const user=await User.findById(userId)
     
        user.name = req.body.firstName;
        user.email = req.body.email;
        user.phone = req.body.phone;

        
        await user.save();

        
        res.redirect("/profile");
    } catch (error) {
       console.log(error.message); 
    }
}





const changeuserpassword = async (req, res) => {
    try {
        const { oldpass, newpass, confirmNewPassword } = req.body;
        
        const userId = req.session.user_id;

      
        if (!userId) {
            return res.status(400).json({ status: false, message: "User session not found" });
        }

       
        const user = await User.findById(userId);
        

        if (!user) {
            return res.status(400).json({ status: false, message: "User not found" });
        }
        if (newpass !== confirmNewPassword) {
            return res.status(400).json({ status: false, message: "Passwords do not match" });
        }
        const isOldPasswordCorrect = await bcrypt.compare(oldpass, user.password);
        if (!isOldPasswordCorrect) {
            return res.status(400).json({ status: false, message: "Your current password is wrong" });
        }
        const newHashedPassword = await bcrypt.hash(newpass, 10); 
        user.password = newHashedPassword;

        await user.save();

        
         res.redirect("/profile");

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};



const createAddressFromCheckout = async (req, res) => {
    try {
        const userID = req.session.user_id;
        const { address_type, name, housename, landmark, city, state, pincode, phone, altphone } = req.body;

       
        const newAddress = {
            addresstype: address_type,
            name,
            housename,
            landmark,
            city,
            state,
            pincode,
            phone,
            altphone
        }

       
        let userAddress = await Address.findOne({ userID: userID });

       
        if (!userAddress) {
            userAddress = new Address({ userID: userID, address: [] });
        }

        userAddress.address.push(newAddress);
        await userAddress.save();

       
        res.redirect("/checkout");
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};






  module.exports={
    getProfilePage,
    addaddress,
    getAddress,
    updateuserdetails,
    changeuserpassword,
    createAddressFromCheckout
  }