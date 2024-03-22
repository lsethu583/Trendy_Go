const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const Products=require('../../models/productModel')
const Category=require('../../models/categoryModel')
const Cart=require('../../models/cartModel')
const Address=require('../../models/adress')
const Orders=require('../../models/orderSchema');
const Coupon = require('../../models/couponSchema')


const getProfilePage= async(req,res)=>{
    try{
        const id = req.session.user_id;
        const coupon = await Coupon.find({isList:true })
        const userDetails = await User.findById(id);
        let address=await Address.findOne({userID:id})
        const orders=await Orders.find({userId:id})
        if(address){
            address = address.address
        }
       res.render('user/profile',{user:userDetails,address:address,orders,coupon})
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
        

        // Check if all required fields are provided
        // if (!addressType || !name || !houseName || !landmark || !city || !state || !pincode || !phone || !altPhone) {
        //     return res.status(400).json({ message: 'All address fields are required' });
        // }

        let existingAddress = await Address.findOne({ userID: userID });
           
        // If editID is provided, find the matched address object
        if (editID) {
           
if (!existingAddress) {
    return res.status(404).json({ message: 'Address not found' });
}

// Find the index of the matched address object
const matchedAddressIndex = existingAddress.address.findIndex(obj => obj._id.toString() === editID);
if (matchedAddressIndex === -1) {
    return res.status(404).json({ message: 'Address with the specified ID not found' });
}

try {
    // Update the matched address object with the new values using findOneAndUpdate
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
            // If no editID, create a new address object
            if (!existingAddress) {
                existingAddress = await Address.create({
                    userID: userID,
                    address: []
                });
            }
            // Add a new address object
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

        // Find the address object that matches the provided addressID
        const matchedAddress = address.address.find(obj => obj._id.toString() === addressID);

        if (!matchedAddress) {
            return res.status(404).json({ message: 'Specified address not found' });
        }

        console.log(matchedAddress);
        // Send the matched address data as JSON response
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
        
        // Retrieve user ID from session
        const userId = req.session.user_id;

        // Check if user ID exists in session
        if (!userId) {
            return res.status(400).json({ status: false, message: "User session not found" });
        }

        // Find user by ID
        const user = await User.findById(userId);
        

        // Check if user exists
        if (!user) {
            return res.status(400).json({ status: false, message: "User not found" });
        }

        // Validate if new password matches confirm password
        if (newpass !== confirmNewPassword) {
            return res.status(400).json({ status: false, message: "Passwords do not match" });
        }

        // Validate if old password matches the one stored
        const isOldPasswordCorrect = await bcrypt.compare(oldpass, user.password);
        if (!isOldPasswordCorrect) {
            return res.status(400).json({ status: false, message: "Your current password is wrong" });
        }

        // Hash the new password
        const newHashedPassword = await bcrypt.hash(newpass, 10); // Increase the number of rounds for better security

        // Update user password
        user.password = newHashedPassword;

        // Save the updated user object
        await user.save();

        return res.status(200).json({ status: true, message: "Password changed successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};



const createAddressFromCheckout = async (req, res) => {
    try {
        const userID = req.session.user_id;
        const { address_type, name, housename, landmark, city, state, pincode, phone, altphone } = req.body;

        // Create a new address object
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

        // Find the user's address
        let userAddress = await Address.findOne({ userID: userID });

        // If user's address not found, create a new one
        if (!userAddress) {
            userAddress = new Address({ userID: userID, address: [] });
        }

        // Push the new address to the address array and save
        userAddress.address.push(newAddress);
        await userAddress.save();

        // Send success response
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