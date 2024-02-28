const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const Products=require('../../models/productModel')
const Category=require('../../models/categoryModel')
const Cart=require('../../models/cartModel')
const Address=require('../../models/adress')
const Orders=require('../../models/orderSchema')

const getProfilePage= async(req,res)=>{
    try{
        const id = req.session.user_id;
        const userDetails = await User.findById(id);
        let address=await Address.findOne({userID:id})
        const orders=await Orders.find({userId:id})
        if(address){
            address = address.address
        }
       res.render('user/profile',{user:userDetails,address:address,orders})
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
        if (!addressType || !name || !houseName || !landmark || !city || !state || !pincode || !phone || !altPhone) {
            return res.status(400).json({ message: 'All address fields are required' });
        }

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






  module.exports={
    getProfilePage,
    addaddress,
    getAddress
   
  }