var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Comments New show form
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    console.log(req.params.id);
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    });
});

//Comments Create store comment to db and redirect
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               // add username and id to comments and save comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               comment.save();
               // save comment to current campground and redirect
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "Successfully added comment");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

//Comments Edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            console.log("No comment with id:" + req.params.comment_id);
            res.redirect("back");
        }else{
            var formObject = {
                campground_id: req.params.id,
                comment: foundComment
            };
            res.render("comments/edit", formObject);
        }
    });
});

//Comment Put
router.put("/:comment_id", middleware.checkCommentOwnership,function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, {text: req.body.comment.text}, function(err){
        if(err){
            console.log("Couldnt update comment with id:" + req.params.comment_id);
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//Comment delete
router.delete("/:comment_id", middleware.checkCommentOwnership,function(req, res){
    Comment.findByIdAndDelete(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        }else{
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

module.exports = router;