var Campground = require("../models/campground");
var Comment = require("../models/comment");

//The file is named index because when we require a directory from a route file it will automatically load the contents of this file
//Look up Section38/357 for more reference

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

//Export our object to our routes
module.exports = middlewareObj;