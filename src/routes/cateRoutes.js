const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/cate");

router.get("/", getCategories);

module.exports = router;
