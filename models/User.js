const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var userSchema = mongoose.Schema({
    uid: String,
    email: String,
    name: String,
    pic: String
});

module.exports = mongoose.model('User', userSchema);