const express = require("express");
const app = express();
const session = require("express-session");
app.use(
  session({
    secret: "keyboardkitteh",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/mongoose_dashboard", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const flash = require("express-flash");
app.use(flash());
var validate = require("mongoose-validator");
const CatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A name is required for this cat."],
    minlength: [2, "Name has a minimum length of 2 characters."]
  },
  age: {
    type: Number,
    required: [true, "This cat's age is required."],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value."
    }
  },
  color: {
    type: String,
    required: [true, "A color is required for this cat."]
  },
  favorite_food: {
    type: String,
    required: [true, "A favorite food is required for this cat."]
  },
  img_link: {
    type: String,
    required: [true, "An image is required for this cat."]
  }
});
// create an object that contains methods for mongoose to interface with MongoDB
const Cat = mongoose.model("Cat", CatSchema);
var moment = require("moment");
app.use(express.static(__dirname + "/static"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.urlencoded({ extended: true }));
app.listen(8000, () => console.log("listening on port 8000"));

app.get("/", (req, res) => {
  Cat.find()
    .then(cats => {
      // logic with users results
      console.log(cats);
      res.render("index", { cats: cats });
    })
    .catch(err => res.json(err));
});

app.get("/cats/new", (req, res) => {
  res.render("newcat");
});

app.post("/cats", (req, res) => {
  const cat = new Cat(req.body);
  cat
    .save()
    .then(() => res.redirect("/"))
    .catch(err => {
      console.log("We have an error!", err);
      // adjust the code below as needed to create a flash message with the tag and content you would like
      for (var key in err.errors) {
        req.flash("new_cat", err.errors[key].message);
      }
      res.redirect("/cats/new");
    });
});

app.get("/cats/:id", (req, res) => {
  console.log("cat id: " + req.params.id);
  Cat.findOne({ _id: req.params.id })
    .then(cat => {
      console.log(cat);
      res.render("catinfo", { cat: cat });
    })
    .catch(err => res.json(err));
});

app.post("/cats/destroy/:id", (req, res) => {
  console.log("cat id: " + req.params.id);
  Cat.remove({ _id: req.params.id })
    .then(() => {
      res.redirect("/");
    })
    .catch(err => res.json(err));
});

app.get("/cats/edit/:id", (req, res) => {
  console.log("cat id: " + req.params.id);
  Cat.findOne({ _id: req.params.id })
    .then(cat => {
      console.log(cat);
      res.render("editcat", { cat: cat });
    })
    .catch(err => res.json(err));
});


app.post("/cats/edit/:id", (req, res) => {
  console.log("cat id: " + req.params.id);
  Cat.findOneAndUpdate({ _id: req.params.id }, {
    name: req.body.name,
    age: req.body.age,
    color: req.body.color,
    favorite_food: req.body.favorite_food,
    img_link: req.body.img_link
  })
    .then(result => {
      console.log("result: " + JSON.stringify(result));
      res.redirect(`/cats/${result._id}`);
    })
    .catch(err => {
      console.log("We have an error!", err);
      // adjust the code below as needed to create a flash message with the tag and content you would like
      for (var key in err.errors) {
        req.flash("edit_cat", err.errors[key].message);
      }
      res.redirect(`/cats/edit/${cat._id}`);
    });
});