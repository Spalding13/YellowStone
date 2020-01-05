var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    flash       = require("connect-flash"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");
    
//requring routes
var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes    = require("./routes/comments"),
    reviewRoutes     = require("./routes/reviews"),
    indexRoutes      = require("./routes/index");

//	-------------Remote DB Connection-------------------------------------
//mongoose.connect(process.env.DATABASEURL ,{ useNewUrlParser: true });

//	-------------Local DB Connection-------------------------------------
mongoose.connect("mongodb://localhost/yellowstone",{ useNewUrlParser: true });

var apiKey = process.env.HERE_MAPS_API_KEY;
  
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(flash());

//seedDB(); seed the database for tests

// MOMENTJS configured and loaded in app as a global variable. Available for all views. 
app.locals.moment = require('moment');
app.locals.moment.locale("en");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "I Like NodeJS !!!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//done takes the profile info and attaches it on the request object
//so its available on your callback as req.user.
// done(error, user, messageObject)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//currentUser, error and success are available in every route template 
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error       = req.flash("error");
   res.locals.success     = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.listen(4000, function(){
   console.log("The YellowStone Server Has Started!");
});  