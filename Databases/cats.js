var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/cat_app")

var catSchema = new mongoose.Schema({
    name: String,
    age: Number,
    temperament: String
});

var Cat = mongoose.model("Cat", catSchema);

//Add cats to db

// var ivka = new Cat({
//     name: "Ivka",
//     age: "22",
//     temperament: "cute"
// });

// var stancho = new Cat({
//     name: "Stancho",
//     age: "12",
//     temperament: "lazy"
// });

// ivka.save(function(err,ivka){
//   if(err){
//       console.log("Something is wrong");
//   }
//   else{
//       console.log("We have entered a cat:");
//       console.log(ivka);
//   }
// });

Cat.create({
    name: "Dimo",
    age: "3",
    temperament: "Energetic"},
    function(err,cat){
        if(err){
          console.log("Something is wrong");
        }else{
          console.log("We have entered a cat:");
          console.log(cat);
        }
    });

//retrieve all cats from db and console.log them


Cat.find(function(err,cats){
    if(err){
    console.log("Error:",err);
    }else{
    console.log("All Cats:");
    console.log(cats);
    }
});