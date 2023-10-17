const mongoose = require("mongoose");

// need to add createdAt, updatedAt dates
const userSchema = mongoose.Schema({
  username:{
    type:String,
    unique: true,
    required: true,
  },
  firstName:{
    type:String,
    required: true,
  },
  lastName:{
    type:String,
    required: true,
  },
  email:{
    type:String,
    unique: true,
    required: true,
  },
  password: {
    type:String,
    required: true,
  },
  role: {
    type:String,
    enum: ["user", "admin"],
    required: true,
  },
  authType:{
    type:String,
    enum: ["internal", "google", "facebook"],
    required: true,
  }
});

module.exports = mongoose.model("User", userSchema);
