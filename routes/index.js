var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
  res.render("register", {page:"register"}); 
});

//handle sign up logic
router.post("/register", function(req, res){ 
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to YellowStone " + user.username);
           res.redirect("/campgrounds"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
  //get the last page visited to redirect later
  var redirectionUrl = req.header('Referer');
  req.cameFrom = redirectionUrl;
  console.log(redirectionUrl);
   res.render("login", {page:"login", lastPage: redirectionUrl}); 
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
      failureRedirect: "/login",
      failureFlash: true
    }), function(req, res){
      //redirect user back 
      req.flash("success", "Welcome to back " + req.user.username);
      var lastPage = req.query.lastPage;
      if(!lastPage.includes("/login")){
        res.redirect(req.query.lastPage);   
      }else{
        res.redirect("/campgrounds"); 
      }
      
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged You Out.");
   res.redirect("/campgrounds");
});

module.exports = router;