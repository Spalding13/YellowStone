var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    password: String
});

// Add functionalities for auth
userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

module.exports=User;