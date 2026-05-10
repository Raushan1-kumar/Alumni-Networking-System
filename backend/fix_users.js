const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected. Updating all existing users to approved...");
    const result = await User.updateMany({}, { $set: { isApproved: true } });
    console.log(`Successfully updated ${result.modifiedCount} old accounts to be approved!`);
    process.exit(0);
  })
  .catch(err => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
