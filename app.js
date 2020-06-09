const cool = require("cool-ascii-faces");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
// const path = require("path");
// const crypto = require("crypto");
const mongoose = require("mongoose")
const flash = require("connect-flash")
const session = require("express-session")
const passport = require("passport")
// const multer = require("multer");
// const GridFsStorage = require("multer-gridfs-storage");
// const Grid = require("gridfs-stream");

const app = express();

//passport config 
require("./config/passport")(passport);

// const Task = require("./models/Task");

//db config
// const db = require('./config/keys').MongoURI;

const mongoURI = "mongodb+srv://peter123:petrepan1234@cluster0-nr9jq.mongodb.net/test?retryWrites=true&w=majority"; 

const mongoDB = process.env.mongoDB_URI || mongoURI;

// const conn = mongoose.createConnection(mongoURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// let gfs;

// conn.once("open", () => {
//   // Init stream
//   gfs = Grid(conn.db, mongoose.mongo);
//   gfs.collection("uploads");
// });

// // Create storage engine
// const storage = new GridFsStorage({
//   url: mongoURI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = buf.toString('hex') + path.extname(file.originalname);
//         const fileInfo = {
//           filename: filename,
//           bucketName: 'uploads'
//         };
//         resolve(fileInfo);
//       });
//     });
//   }
// });
// const upload = multer({ storage });




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

// app.post("/task", upload.any(), (req, res) => {
//   // const task = new Task({
//   //   username: req.body.username,
//   // })
//   // task.save().then(result => {
//   //    console.log(result);
//   //    req.flash("success_msg", "Task submitted");
//   //    res.redirect("/dashboard");
//   // }).catch(err=>console.log(err)) 
//   console.log(req.body)
//   console.log("yehah");
//   req.flash("success_msg", "Task submitted");
//   // res.json({ file: req.file });
//   res.redirect("/dashboard");
// }); 

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.get("/cool", (req, res) => res.send(cool()));



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`))