var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/ref_demo",{ useNewUrlParser: true });

var Post = require("./models/post");

var User = require("./models/user");

Post.create({
    title: "How to cook the best burger! Pt.4",
    content: "Serve with mustard!"
},function(err,post){
    User.findOne({email: "bob@yahoo.com"},function(err,user){
        if(err){
            console.log(err);
        }else{
            user.posts.push(post);
            user.save(function(err, data){
                if(!err){
                    console.log(data);
                }
            })
        }
    });
});


//Find all post for the user
User.findOne({email: "bob@yahoo.com"}).populate("posts").exec(function(err,data){
    if(!err){
        console.log(data);
    }
});