const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/socket-chat');
  console.log('connected to socket-chat DB');
}

module.exports = {
  connectDB
}
