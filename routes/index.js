const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
var nodemailer = require("nodemailer");
var LocalStrategy = require("passport-local").Strategy;
var async = require("async");
var crypto = require("crypto");
const { ensureAuthenticated } = require("../config/auth")
const { ensureAdminAuthenticated } = require("../config/adminauth");

const User = require("../models/User");
const Withdraw = require("../models/Withdraw");
const Task = require("../models/Task");
const Plan = require("../models/Plan");
const Admin = require("../models/Admin");
const Planmercury = require("../models/Planmercury")

//home page
router.get('/', (req, res) => 
    res.render("welcome")
);

//profile
router.get("/profile", ensureAuthenticated, (req, res) =>{
    res.render("profile", {
      username: req.user.username,
      fullname: req.user.fullname,
      number: req.user.number,
      username: req.user.username,
      accountname: req.user.accountname,
      accountnumber: req.user.accountnumber,
      accountbank: req.user.accountbank,
    });
  console.log(req.user) 
}

);

// router.put("/profileup", (req, res, next) => {

//   User.findByIdAndUpdate({ _id: req.body.id }, req.body, {
//     useFindAndModify: false}).then(function () {
//     User.findOne({ _id: req.user.id }).then(function (user) {
//       if (user) {
//         console.log(user);
//         req.flash("success_msg", "Profile Updated");
//         res.redirect("/dashboard");
//       }
//     });
//   });
      
// })

// router.put("/profileup", (req, res, next) => {

//     User.updateOne({ _id: req.user.id }, req.body, function (user) {
//       if (user) {
//         console.log(user);
//         req.flash("success_msg", "Profile Updated");
//         res.render("/dashboard");
//       }
//     });
//   });


 
//dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    username: req.user.username,
    accountnumber: req.user.accountnumber,
    accountbank: req.user.accountbank,
  });
  console.log(req.user) 
}
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

//whatsapp
router.post(
  "/planmercury",
 (req, res) => {
    const { mercury, username, accountnumber, accountbank } = req.body;

    const planmercury = new Planmercury({
      username,
      mercury,
      accountnumber,
      accountbank,
    });

    planmercury
      .save()
      .then((result) => {
        console.log(result);
        console.log(`successful${mercury}`);
        req.flash("success_msg", "Subscription successful");
        res.redirect("/dashboard");
      })
      .catch((err) => console.log(err));
  }
);

router.post("/freeplan", (req, res) => {
  const { freeplan, mercury, username, accountnumber, accountbank } = req.body;

  let errors = [];

     Plan.findOne({ username: username })
       .then((plan) => {
         console.log(req.body)
         if (plan) {
           //user exist
           console.log(`unsuccessful${freeplan}`);
           errors.push({ msg: "Your free plan is expired, choose one of the other plans" });
           res.render("dashboard", {
             errors,
             username,
             freeplan,
             accountnumber,
             accountbank, 
           });
         } else {
           const plan = new Plan({ 
             freeplan,
             username,
             accountnumber,
             accountbank,
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


router.get("/password", function (req, res) {
  res.render("password", {
    user: req.user
  })
})


router.post("/forgot", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/password");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) { 
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        let transporter = nodemailer.createTransport({
          pool: true,
          host: "mail.privateemail.com",
          port: 465,
          secure: true,
          auth: {
            user: "admin@tweetwallet.co",
            pass: "tweetwalletadminplnja",
          },
        });
        let mailOptions = {
          to: user.email,
          from: "admin@tweetwallet.co",
          subject: "Tweetwallet Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token + 
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        transporter.sendMail(mailOptions, function (err) {
          req.flash(
            "success_msg",
            "An e-mail has been sent to " +
              user.email +
              " with further instructions."
          );
          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect("/password");
    }
  );
});

router.get("/reset/:token", function (req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("reset", {
        user: req.user,
      });
    }
  );
});
 
router.post("/reset/:token", function (req, res) {
  async.waterfall(
    [ 
      function (done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          function (err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }

            user.password = req.user.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) { 
              req.logIn(user, function (err) { 
                done(err, user);
              });
            });
          }
        );
      },
      function (user, done) {
          let transporter = nodemailer.createTransport({
            pool: true,
            host: "mail.privateemail.com",
            port: 465,
            secure: true,
            auth: {
              user: "admin@tweetwallet.co",
              pass: "tweetwalletadminplnja",
            },
          });
        let mailOptions = { 
          to: user.email,
          from: "admin@tweetwallet.co",
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account has just been changed.\n", 
        };
        transporter.sendMail(mailOptions, function (err) {
          req.flash("success_msg", "Success! Your password has been changed.");
          done(err);
        });
      },
    ],
    function (err) {  
      res.redirect("/users/login");
    }
  );
});

 
module.exports = router;