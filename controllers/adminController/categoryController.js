

const fs = require("fs");
const Category = require('../../models/categoryModel');
const User = require('../../models/userModel');


const loadCategoryList = async (req, res) => {
    try {
        const category = await Category.find({});
        if (req.session.admin) {
            res.render('categories', { category });
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const loadCategoryAdd = async (req, res) => {
    try {
        if (req.session.admin) {
            res.render('addCategory');
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
      
    }
};

const addingNewCategory = async (req, res) => {
    try {
        
        
        const exist = await Category.findOne({ categoryName: req.body.categoryName });
        if (exist) {
            if (req.session.admin) {
                res.render('categories', { message: "Category already exists" });
            }
        } else {
            const category = new Category({
                categoryName: req.body.categoryName,
                image:req.file.filename,
                description:req.body.description
            });
            await category.save();
            res.redirect('/admin/addCategory');
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const editCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const category = await Category.findById(id);
        if (req.session.admin) {
            res.render('editCategory', { category });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const editCategorySubmiting = async (req, res) => {
    try {
        const id = req.query.id;
        const exist = await Category.findOne({ categoryName: req.body.categoryName });
        if (exist) {
            const category = await Category.findById(id);
            res.render('editCategory', { message: "Already exist", category });
        } else {
            if (req.file) {
                const data = {
                    categoryName: req.body.categoryName,
                    category_logo: req.file.filename
                };
                await Category.findByIdAndUpdate({ _id: id }, { $set: data });
                res.redirect('/admin/addCategory');
            } else {
                const category = await Category.findById(id);
                const data = {
                    categoryName: req.body.categoryName,
                    image: category.image,
                    description:description
                };
                await Category.findByIdAndUpdate({ _id: id }, { $set: data });
                res.redirect('/admin/addCategory');
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const blockCategory = async (req, res) => {
    try {
        
        const id = req.query.id;
        
        const category = await Category.findById(id);
        if (category) {
            // Toggle the is_Listed property
            category.is_Listed = !category.is_Listed;
            await category.save();
            res.status(200).send('success')
        } else {
            res.status(404).send("Category not found");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    loadCategoryList,
    loadCategoryAdd,
    addingNewCategory,
    editCategory,
    editCategorySubmiting,
    blockCategory
};
