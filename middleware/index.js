var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");

//The file is named index because when we require a directory from a route file it will automatically load the contents of this file
//Look up Section38/357 from documentation for more reference

//One way to add middleware functions to object
var middlewareObj = {
    checkCampgroundOwnership: function checkCampgroundOwnership(req, res, next){
        if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err, foundCampground) {
                if(err || !foundCampground){
                    console.log("No campground with id:" + req.params.id + "ERROR: " + err);
                    req.flash("error", "Campground not found");
                    res.redirect("/campgrounds");
                }else{
                    if(foundCampground.author.id.equals(req.user._id)){
                        next();
                    }
                    else{
                        req.flash("error", "You don't have permission to do that!");
                        res.redirect("back");
                    }
                }
            });
        }else{
            res.redirect("back");
        }
    }
};

//Other way of adding middleware functions to object
middlewareObj.checkCommentOwnership = function (req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment){
                console.log("No comment with id:" + req.params.comment_id + "ERROR" + err);
                req.flash("error", "Comment not found");
                res.redirect("/campgrounds");
            }else{
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("error", "You don't have permission to do that")
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be Logged In");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    //Check if there is a logged in user
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be Logged In");
    res.redirect("/login");
};

middlewareObj.getCurrentDate = function(req, res, next){
    var options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
    var date = new Date(Date.now()).toLocaleDateString(options);

    req.date = "Date: " + date;
    console.log("test");
    next();
};

// Reviews system middleware
middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Review.findById(req.params.review_id, function (err, foundReview) {
            if(err || !foundReview){
                console.log("ERROR IN MIDDLEWARE function")
                res.redirect("back");
            } else {
                // does user own the review?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                // some() is an array method which returns true if any element of the array is matched
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

//Export our object to our routes
module.exports = middlewareObj;