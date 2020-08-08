const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose")
const flash = require("connect-flash")
const session = require("express-session")
const passport = require("passport")
const methodOverride = require("method-override");


const app = express();

//passport config 
require("./config/passport")(passport);

const mongoURI = "mongodb+srv://peter123:petrepan1234@cluster0-nr9jq.mongodb.net/test?retryWrites=true&w=majority";

const mongoDB = process.env.mongoDB_URI || mongoURI;


//connect to mongo
mongoose
  .connect(mongoURI, { useUnifiedTopology: true,useNewUrlParser: true })
  .then(()=> console.log("mongoDB connected.."))
  .catch((err) => console.log(err)); 

//ejs
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); 

//bodyparser

app.use(express.urlencoded({ extended: true }))

app.use(methodOverride("newMethod"));

//express session
app.use(
  session({
    secret: "keyboard cat", 
    resave: true,
    saveUninitialized: true,
  })
);


//passport middleware
app.use(passport.initialize());
app.use(passport.session());  
 

//Connect flash
app.use(flash()) 

//global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
})


//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`))