const Category = require("../model/cate");

const getCategories = async(req, res) => {
    try {
        const cate= await Category.getAll();
        res.json(cate)
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

module.exports = { getCategories };
