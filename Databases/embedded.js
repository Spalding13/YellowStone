var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/associations_demo",{ useNewUrlParser: true });


// POST - title,content
var postSchema = new mongoose.Schema({
    title: String,
    content: String
});
var Post = mongoose.model("Post",postSchema);



// USER - email, name
var userSchema = new mongoose.Schema({
     email: String,
     name: String,  
     posts:[postSchema]
});
var User = mongoose.model("User",userSchema);


// var newUser = new User({
//     email: "stancho_l@yahoo.com",
//     name: "Stanio"
// });


// newUser.posts.push({
//   title:"Trip to Turkey",
//   content: "The Turkish nation is the most advanced of all, kebabs for everyone!"
// });

// newUser.save((err,user)=>{
//     if(err){
//         console.log(err)
//     }
//     else{
//         console.log(user)
//     }
// });


User.findOne({name:"Stanio"},function(err,user){
    if(err){
        console.log(err)}
    else{
        user.posts.push({
            title:"Airan appreciation",
            content:"The most refreshing bevarage"
        });
        user.save(function(err,user){
            if(err){
                console.log(err);
            }else{
                console.log(user);
            }
        });
    }
});