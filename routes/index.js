const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth")

const User = require("../models/User");
const Withdraw = require("../models/Withdraw");
const Task = require("../models/Task");


//home page
router.get('/', (req, res) => 
    res.render("welcome")
);

//profile
router.get("/profile", ensureAuthenticated, (req, res) =>
  res.render("profile", {
    username: req.user.username,
    fullname: req.user.fullname,
    number: req.user.number,
    username: req.user.username,
    accountname: req.user.accountname,
    accountnumber: req.user.accountnumber,
    accountbank: req.user.accountbank,
    
  })
);

// router.put("/profile", (req, res, next) => {
//   let newProfile = new User({
//     username: req.body.username,
//     fullname: req.body.fullname,
//     accountbank: req.body.accountbank,
//     accountname: req.body.accountname,
//     accountnumber: req.body.accountnumber,
//     number: req.body.number
//   })

//   User.findOneAndUpdate({ username }, newProfile, (err, profile) => {
//     if (err) {
//       res.render("/profile", {
//         success: false, msg: "Failed to update"
//       })
//     } else {
//       newProfile.save().then(user => {
//          res.redirect("/dashboard", {
//            newProfile,
//            success: true,
//            msg: "Profile Updated",
//          });
//       }
       
//       );
   
//     }
//   })
      
// })

// router.get("/profile/:username", ensureAuthenticated, (req, res) =>
//   res.render("profile", {
//     username: req.query.username,
//     fullname: req.query.fullname,
//     number: req.query.number,
//     username: req.query.username,
//     accountname: req.query.accountname,
//     accountnumber: req.query.accountnumber,
//     accountbank: req.query.accountbank,
//   })
// );

//dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    username: req.user.username,
    accountnumber: req.user.accountnumber,
    accountbank: req.user.accountbank,  
  })
);

router.post("/withdraw", (req, res) => {
  const {
    fullname,
    username,
    amountwithdraw,
    accountname,
    accountnumber,
    accountbank,
  } = req.body;

  const withdraw = new Withdraw({
    fullname,
    username,
    amountwithdraw,
    accountname,
    accountnumber,
    accountbank
  });

  withdraw.save()
    .then(result => {
      console.log(result)
      console.log(`successful${amountwithdraw}`);
      req.flash("success_msg", "Withdrawal successful");
      res.redirect('/dashboard')
    }).catch(err=> console.log(err))
})

// router.post("/task", (req, res) => {
//   const {
//     fullname,
//     username,
//     amountwithdraw,
//     accountname,
//     accountnumber,
//     accountbank,
//   } = req.body;

//   const task = new Task({
//     username,
//     file1,
//     file2
//   });

//   task
//     .save()
//     .then((result) => {
//       console.log(result);
//       console.log(`successful${username}`);
//       req.flash("success_msg", "Withdrawal successful");
//       res.redirect("/dashboard");
//     })
//     .catch((err) => console.log(err));
// });



//admiin
router.get("/admin", (req, res) => {
  Withdraw.find({}, (err, data) => {
    res.render("admin", { data: data });
  });
});

module.exports = router;