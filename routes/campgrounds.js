var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleware = require("../middleware");
var multer = require('multer');
var cloudinary = require('cloudinary');

/* Image upload with multer and cloudify*/
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
}
});
var imageFilter = function (req, file, cb) {
    // accept image files only, by ensuring it ends with the specified suffix
    // i is a flag to ignore upper/lower case difference, $ ensures it ends with the previous option
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

cloudinary.config({ 
  cloud_name: 'dy5bpoftc', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/*Define escapeRegex function for search feature*/
function escapeRegex(text) {
    // the g flag performs a gobal match (finds all matches rather than stopping after the first match)
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// INDEX - show all campgrounds
router.get("/", function(req, res){
    if(req.query.search && (req.query.clear == undefined)){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get campgrounds from DB matching the regex
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
            console.log(err);
        } else {
            if (allCampgrounds.length < 1){
                var noMatch = "No campgrounds match that query, please try again!";
                console.log(req.query.search)
                res.render("campgrounds/index", {campgrounds:allCampgrounds, noMatch:noMatch, search:req.query.search, page:"campgrounds"});
            } else {
                res.render("campgrounds/index", {campgrounds:allCampgrounds, noMatch:"", search:req.query.search, page:"campgrounds"});
            }
        }
    });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds:allCampgrounds,  noMatch:"", search:"", page:"campgrounds"});
            }
        }); 
    }
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, middleware.getCurrentDate, upload.single('image'), function(req, res){
    /*'image' corresponds to the specified field name in the form!*/
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        /*console.log(result.public_id);*/
        console.log(req.body)
        // get data from form and store in a temporary object
        var image = result.secure_url;
        var imageId = result.public_id;

        var name = req.body.name;
        var price = req.body.price;
        var location = req.body.location;
        var desc = req.body.description;
        var date = req.date;

        var author = {
            id: req.user._id,
            username : req.user.username
        };

        var newCampground = {name: name, image: image, imageId: imageId, location:location, description: desc, date: date, author: author, price: price};

        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                res.redirect("/campgrounds");
            }
        });
    });
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log("No campground with id:" + req.params.id);
            res.redirect("back");
        }else{
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UPDATE CAMPGROUND ROUTE 
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});

// DELETE CAMPGROUND ROUTE
router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

module.exports = router;