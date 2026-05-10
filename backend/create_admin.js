const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to database...");
    
    const User = require("./models/User");
    
    // Check if admin already exists
    const existing = await User.findOne({ email: "admin@gecalumni.com" });
    if (existing) {
      // Delete old broken account and recreate
      await User.deleteOne({ email: "admin@gecalumni.com" });
      console.log("Removed old admin account, recreating...");
    }

    await User.create({
      name: "Platform Admin",
      email: "admin@gecalumni.com",
      password: "Admin@1234",   // pre-save hook in User.js hashes this automatically
      role: "admin",
      isApproved: true,
      department: "Administration",
      batchYear: 2000,
    });

    console.log("✅ Admin account created successfully!");
    console.log("📧 Email:    admin@gecalumni.com");
    console.log("🔑 Password: Admin@1234");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
