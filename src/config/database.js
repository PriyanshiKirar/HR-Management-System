const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://priyanshi:priyanshi@cluster0.yu8fm.mongodb.net/", {
      // useNewUrlParser: true, // deprecated
      // useUnifiedTopology: true, // deprecated
      // useCreateIndex: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

