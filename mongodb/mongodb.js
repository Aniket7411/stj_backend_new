const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const instance = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.set("debug", true);
    console.log("Connected to MongoDB");
    return mongoose.connection;
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

module.exports = connectDB;
