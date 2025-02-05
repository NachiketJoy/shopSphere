const mongoose = require("mongoose");
const Product = require("../models/productModels");
const connectDB = require("./db");
require("dotenv").config();

const categories = [
  "Technology",
  "Clothing",
  "Food",
  "Home & Garden",
  "Sports & Outdoors",
  "Books",
  "Beauty & Health",
  "Toys & Games",
  "Automotive",
  "Pet Supplies",
];

const retailers = [
  "Amazon",
  "Walmart",
  "Target",
  "Best Buy",
  "Costco",
  "eBay",
  "Newegg",
  "Home Depot",
  "Macy's",
  "PetSmart",
];

const generateProducts = () => {
  const products = [];

  categories.forEach((category) => {
    // Generate 10 products for each category
    for (let i = 1; i <= 10; i++) {
      const basePrice = Math.floor(Math.random() * 900) + 100; // Random price between 100 and 1000
      const numRetailers = Math.floor(Math.random() * 4) + 2; // Random number between 2 and 5
      const selectedRetailers = [...retailers]
        .sort(() => 0.5 - Math.random())
        .slice(0, numRetailers);

      selectedRetailers.forEach((retailer) => {
        // Add small random variation to price for different retailers
        const priceVariation = basePrice * (Math.random() * 0.2 - 0.1); // ±10% variation
        const finalPrice = Math.round(basePrice + priceVariation);

        products.push({
          name: `${category} Product ${i}`,
          description: `This is a detailed description for ${category} Product ${i}`,
          images: [
            `https://placehold.co/400x400?text=${category.toLowerCase()}_${i}_1`,
            `https://placehold.co/400x400?text=${category.toLowerCase()}_${i}_2`,
            `https://placehold.co/400x400?text=${category.toLowerCase()}_${i}_3`
          ],
          price: finalPrice,
          category: category,
          retailer: retailer,
          quantity: Math.floor(Math.random() * 100) + 1, // Random quantity between 1 and 100
        });
      });
    }
  });

  return products;
};

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany();

    // Generate and insert new data
    const products = generateProducts();
    await Product.insertMany(products);

    console.log("Data imported successfully!");
    console.log(`Total products created: ${products.length}`);
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
};

importData();
