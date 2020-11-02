const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
var nodemailer = require("nodemailer");
var LocalStrategy = require("passport-local").Strategy;
var async = require("async");
var crypto = require("crypto");
const { ensureAuthenticated } = require("../config/auth");
const { ensureAdminAuthenticated } = require("../config/adminauth");

const User = require("../models/User");
const Withdraw = require("../models/Withdraw");
const Task = require("../models/Task");
const Plan = require("../models/Plan");
const Admin = require("../models/Admin");
const Totalfunds = require("../models/Totalfunds");
const Planmercury = require("../models/Planmercury");

//home page
router.get("/", (req, res) => res.render("welcome"));

//profile
router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", {
    username: req.user.username,
    fullname: req.user.fullname,
    number: req.user.number,
    username: req.user.username,
    accountname: req.user.accountname,
    accountnumber: req.user.accountnumber,
    accountbank: req.user.accountbank,
  });
});

//dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Plan.find().then((plan) => {
    res.render("dashboard", {
      user: req.user,
      plan: plan,
    });
    console.log(req.user);
  });
});

router.get("/withdraw", ensureAuthenticated, (req, res) => {
  User.findOne(req.user._id)
    .populate("task totalfunds plan")
    .then((user) => {
      function accbal(bal) {
        let calcbal = 0;
        for (let i = 0; i < bal.length; i++) {
          if (bal[i].allowBalance) {
            calcbal += bal[i].accountbalance;
          }
        }
        return calcbal;
      }

      if (user.totalfunds !== undefined) {
        res.render("withdraw", {
          user: req.user,
          task: user.task,
          total: accbal(user.totalfunds),
          plan: user.plan,
        });
      } else {
        res.render("withdraw", {
          user: req.user,
          task: user.task,
          total: 0,
          plan: user.plan,
        });
      }
    })
    .catch((err) => console.log(err));
});

router.get("/task", ensureAuthenticated, (req, res) => {
  User.findOne(req.user._id)
    .populate("plan totalfunds")
    .then((user) => {
      console.log(user.totalfunds);
      if (user.plan !== undefined && user.task !== undefined) {
        res.render("task", {
          user: req.user,
          plan: user.plan,
          task: user.totalfunds,
        });
      } else {
        res.render("task", {
          user: req.user,
          plan: null,
          task: [],
        });
      }
    });
});

router.post("/withdraw", ensureAuthenticated, (req, res) => {
  const {
    username,
    amountwithdraw,
    accountname,
    accountnumber,
    accountbank,
  } = req.body;

  const withdraw = new Withdraw({
    username,
    amountwithdraw,
    accountname,
    accountnumber,
    accountbank,
  });

  console.log(withdraw);

  User.findOne({ _id: req.user._id })
    .populate("task totalfunds plan")
    .then((user) => {
      user.withdraw = withdraw;

      function checkTrue(task) {
        let falseDaily = 0;
        for (let i = 0; i < task.length; i++) {
          if (task[i].allowBalance) {
            falseDaily += task[i].daily;
          }
        }
        return falseDaily;
      }

      let errors = [];

      function accbal(bal) {
        let calcbal = 0;
        for (let i = 0; i < bal.length; i++) {
          calcbal += bal[i].accountbalance;
        }
        return calcbal;
      }

      if (Number(amountwithdraw) > accbal(user.totalfunds)) {
        return errors.push({
          msg:
            "You have an insufficient balance, pay for a new plan or try a lesser amount",
        });
      }

      let showbal = -amountwithdraw;

      let totalbalance = new Totalfunds({
        accountbalance: showbal,
        allowBalance: true,
      });

      function lastfuc() {
        let poplast = user.totalfunds;
        let showpop = poplast.pop();

        let calcresult = accbal(poplast);
        return calcresult;
      }

      if (Number(amountwithdraw) > lastfuc) {
        errors.push({
          msg:
            "You have an insufficient balance, pay for a new plan or try a lesser amount",
        });
      }

      user.totalfunds.push(totalbalance);

      if (errors.length > 0) {
        res.render("withdraw", {
          errors,
          user: req.user,
          plan: user.plan,
          total: accbal(user.totalfunds),
        });
      } else {
        user
          .save()
          .then((done) => {
            withdraw
              .save()
              .then((result) => {
                totalbalance
                  .save()
                  .then((results) => {
                    req.flash("success_msg", "Withdrawal successfully made");
                    res.redirect("/withdraw");
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});

//task
router.post("/task/:id", (req, res) => {
  const id = req.params.id;
  const { username, daily, sub, task1, task2, task3 } = req.body;
  let allowBalance;
  allowBalance ? false : true;

  const task = new Task({
    username,
    task1,
    daily,
    sub,
    task2,
    task3,
    allowBalance,
  });

  User.findById(id)
    .populate("task totalfunds")
    .then((user) => {
      user.task.push(task);

      function checkTrue(usertask) {
        let falseDaily;
        for (let i = 0; i < usertask.length; i++) {
          // if (usertask[i].allowBalance) {
          //   falseDaily += usertask[i].daily;
          // }
          falseDaily = usertask[i].daily;
        }
        return falseDaily;
      }

      console.log(checkTrue(user.totalfunds));

      const totalfund = new Totalfunds({
        username,
        accountbalance: checkTrue(user.task),
        task1,
        task2,
        task3,
        allowBalance,
      });

      user.totalfunds.push(totalfund);

      console.log(user.totalfunds);

      user
        .save()
        .then((user) => {
          task
            .save()
            .then((result) => {
              totalfund.save().then((totall) => {
                req.flash(
                  "success_msg",
                  "Your Task has been submitted for approval"
                );
                res.redirect("/task");
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    });
});

//whatsapp
router.post("/subscription/:id", (req, res) => {
  const id = req.body.username;
  console.log(id);
  const { sub, daily, username } = req.body;
  let allowBalance;
  allowBalance ? false : true;

  User.findOne({ username: req.body.username }).then((user) => {
    console.log(user);
    const newPlan = new Plan({
      username: username,
      sub: sub,
      daily: daily,
      allowBalance: allowBalance,
    });
    user.plan = newPlan;

    user
      .save()
      .then((result) => {
        console.log(result);
        console.log(`successful${user.plan.daily}`);

        newPlan.save().then((subplan) => {
          req.flash("success_msg", "User has been successfully activated. ");
          res.redirect("/admin/verify");
        });
      })
      .catch((err) => console.log(err));
  });
});

router.post("/freeplan", (req, res) => {
  const { freeplan, mercury, username, accountnumber, accountbank } = req.body;

  let errors = [];

  Plan.findOne({ username: username })
    .then((plan) => {
      if (plan) {
        //user exist
        console.log(`unsuccessful${freeplan}`);
        errors.push({
          msg: "Your free plan is expired, choose one of the other plans",
        });
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
            req.flash(
              "success_msg",
              "Free Plan activated, You can now start posting your task on twitter"
            );
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
  const { admin, password } = req.body;
  let errors = [];
  //check required fields
  if (!admin || !password) {
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
          password,
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
  function accbal(bal) {
    let calcbal = 0;
    for (let i = 0; i < bal.length; i++) { 
      let value = bal[i];

      for (let j = 0; j < bal[i].length; j++)
        if (bal[i].allowBalance) {
          calcbal += bal[i][j].accountbalance;
          console.log(calcbal)
        }
    }
    // if (bal[i].allowBalance) {
    //   calcbal += bal[i].accountbalance;
    // }

    
  }

  User.find()
    .populate("totalfunds")
    .then((data) => {
      let filterFunds = data.map((funds) => {
        return funds.totalfunds;
      });

      res.render("admin", { data: data, total: accbal(filterFunds) });
    })
    .catch((err) => console.log(err));
});

router.get("/admin/task", ensureAdminAuthenticated, (req, res) => {
  Totalfunds.find({}, (err, data) => {
    res.render("adminTask", { data: data });
  });
});

router.post("/taskApprove/:id", (req, res) => {
  // let allowBalance = true;
  let allowBalance = !req.body.allowBalance;
  console.log(req.params.id);
  // let task = new Task({ allowBalance: allowBalance })
  Totalfunds.findById(req.params.id).then((task) => {
    task.allowBalance = allowBalance;
    task.save().then((done) => {
      if (task.allowBalance) {
        req.flash("success_msg", "Task has been successfully approved");
      } else {
        req.flash("error_msg", "Task has been disapproved");
      }
      res.redirect("/admin/task");
    });
  });
});

router.get("/admin/verify", ensureAdminAuthenticated, (req, res) => {
  Plan.find({}, (err, data) => {
    res.render("adminVerify", { data: data });
  });
});

router.get("/password", function (req, res) {
  res.render("password", {
    user: req.user,
  });
});

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
      res.redirect("/dashboard");
    }
  );
});

module.exports = router;
