const Product = require("../models/productModels");
const Auth = require("../models/authModels");

// Get all products with search, filter, and sort
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      retailer,
      sortBy,
      order = "asc",
      page = 1,
      limit = 12,
    } = req.query;

    const admin_login_email = process.env.ADMIN_LOGIN_EMAIL;
    const users = await Auth.find();
    const adminUser = users.find((user) => user.email === admin_login_email);
    const isAdmin = adminUser.email === req.user.email;

    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by retailer
    if (retailer) {
      query.retailer = retailer;
    }

    // Build sort object
    let sortObject = {};
    if (sortBy) {
      if (sortBy === "price" || sortBy === "quantity") {
        sortObject[sortBy] = order === "desc" ? -1 : 1;
      }
    }

    // Calculate skip value for pagination
    // const skip = (page - 1) * limit;
    const skip = isAdmin ? 0 : (page - 1) * limit;
    const limitValue = isAdmin ? 0 : parseInt(limit);


    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limitValue));

    // Get total count for pagination
    // const total = await Product.countDocuments(query);
    const total = isAdmin ? products.length : await Product.countDocuments(query);


    res.status(200).json({
      success: true,
      data: products,
      pagination: isAdmin ? 
        null :
        {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error retrieving products",
      error: err.message,
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error retrieving product",
      error: err.message,
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: err.message,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: err.message,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: err.message,
    });
  }
};
