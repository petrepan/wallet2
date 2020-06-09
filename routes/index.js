const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth")
const { ensureAdminAuthenticated } = require("../config/adminauth");

const User = require("../models/User");
const Withdraw = require("../models/Withdraw");
const Task = require("../models/Task");
const Plan = require("../models/Plan");
const Admin = require("../models/Admin");


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
    accountbank: req.user.accountbank
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

//task
router.post("/task", (req, res) => {
  const {
    username,
    task1,
    task2,
  } = req.body;

  const task = new Task({
    username,
    task1,
    task2,
  });

  task.save()
    .then((result) => {
      console.log(result);
      console.log(`successful${task1}`);
      req.flash("success_msg", "Task Submitted");
      res.redirect("/dashboard");
    })
    .catch((err) => console.log(err));
});

router.post("/plan", (req, res) => {
  const { freeplan, username, accountnumber, accountname, accountbank } = req.body;

  let errors = [];

     Plan.findOne({ freeplan: freeplan })
       .then((plan) => {
         if (plan) {
           //user exist
           errors.push({ msg: "You can't suscribe twice on free plan, choose one of the other plans" });
           res.render("./dashboard", {
             errors,
             username,
             accountname,
             accountnumber,
             accountbank
           });
         } else {
           const plan = new Plan({
             freeplan,
           });
           //free plan

           plan
             .save()
             .then((result) => {
               console.log(result);
               console.log(`successful${freeplan}`);
               req.flash("success_msg", "Free Plan activated, You can now start posting your task on twitter");
               res.redirect("/dashboard");
             })
             .catch((err) => console.log(err));
         }
       })
       .catch((err) => console.log(err)); 
});


//admiin
router.get("/admin/login", (req, res) => {
  res.render("adminLogin");
});

router.get("/admin/register", (req, res) => {
  res.render("adminRegister");
});

router.post("/admin/register", (req, res) => {
  const {
    admin,
    password,
  } = req.body;
  let errors = [];
  //check required fields
  if (
    !admin ||
    !password
  ) {
    errors.push({ msg: "Please fill in all fields" });
  }


  if (errors.length > 0) {
    res.render("admin/register", {
      errors,
      admin,
      password,
    });
  } else {
    //Validation pass
    Admin.findOne({ admin: admin }).then((user) => {
      if (user) {
        //user exist
        errors.push({ msg: "Username is already registered" });
        res.render("admin/register", {
          errors,
          admin,
          password
        });
      } else {
        const newAdmin = new Admin({
          admin,
          password,
        });
        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) throw err;
            //set password to hash
            newAdmin.password = hash;
            //save Admin
            newAdmin
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can login"
                );
                res.redirect("/admin/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

router.post("/admin/login", (req, res, next) => {
  passport.authenticate("admin", {
    successRedirect: "/admin",
    failureRedirect: "/admin/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/admin/withdrawal", ensureAdminAuthenticated, (req, res) => {
  Withdraw.find({}, (err, data) => {
    res.render("adminWithdrawal", { data: data });
  });
});

router.get("/admin", ensureAdminAuthenticated, (req, res) => {
  User.find({}, (err, data) => {
    res.render("admin", { data: data });
  });
});

router.get("/admin/task", ensureAdminAuthenticated, (req, res) => {
  Task.find({}, (err, data) => {
    res.render("adminTask", { data: data });
  });
});

router.get("/admin/freeplan", ensureAdminAuthenticated, (req, res) => {
  Plan.find({}, (err, data) => {
    res.render("adminFreeUsers", { data: data });
  });
});

module.exports = router;