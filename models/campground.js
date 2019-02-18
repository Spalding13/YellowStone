var mongoose = require("mongoose");

var schema = new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    price: {
        type: String,
        default: 9
    },
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
    }]
});

module.exports = mongoose.model("Campground",schema);