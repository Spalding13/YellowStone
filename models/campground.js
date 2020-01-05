var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
    name:String,
    image:String,
    // public id in clodinary
    imageId:String,
    description:String,
    date: String,
    location: String,
    createdAt: { type: Date, default: Date.now},
    lat: Number,
    lng: Number,
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
    // Since there are many comments on a single campground, an array holding
    // object id's is used to hold the references to these documents
    comments:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
    }],
    // Associate author id/username of each review to the campground
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);

