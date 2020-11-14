const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodeMailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
var multer = require("multer");

const { ensureAuthenticated } = require("../config/auth");
const { ensureAdminAuthenticated } = require("../config/adminauth");

const User = require("../models/User");
const Withdraw = require("../models/Withdraw");
const Task = require("../models/Task");
const Plan = require("../models/Plan");
const Admin = require("../models/Admin");
const Totalfunds = require("../models/Totalfunds");
const Upload = require("../models/Upload");

//home page
router.get("/", (req, res) => res.render("welcome", { req: req }));

router.get("/advertise", (req, res) => res.render("advertise", { req: req }));

router.get("/faq", (req, res) => res.render("faq", { req: req }));

//profile
router.get("/profile/:id", ensureAuthenticated, (req, res) => {
  res.render("profile", {
    username: req.user.username,
    fullname: req.user.fullname,
    number: req.user.number,
    username: req.user.username,
    accountname: req.user.accountname,
    accountnumber: req.user.accountnumber,
    accountbank: req.user.accountbank,
    id: req.user.id,
  });
});

//edit profile
router.get("/profile/edit/:id", ensureAuthenticated, (req, res) => {
  res.render("edit", {
    username: req.user.username,
    fullname: req.user.fullname,
    number: req.user.number,
    username: req.user.username,
    accountname: req.user.accountname,
    accountnumber: req.user.accountnumber,
    accountbank: req.user.accountbank,
    id: req.user.id,
  });
});

router.put("/profile/:id", ensureAuthenticated, async (req, res) => {
  let id = req.user.id;
  const {
    fullname,
    username,
    number,
    accountname,
    accountnumber,
    accountbank,
  } = req.body;
  let errors = [];

  if (errors.length > 0) {
    res.render("edit", {
      errors,
      id,
      fullname,
      username,
      number,
      accountname,
      accountnumber,
      accountbank,
    });
  } else {
    let user = req.user;
    user.fullname = req.body.fullname;
    user.username = req.body.username;
    user.number = req.body.number;
    user.accountname = req.body.account_name;
    user.accountnumber = req.body.accountnumber;
    user.accountbank = req.body.accountbank;

    try {
      user = await user.save();
      req.flash("success_msg", "Profile Succesfuly Updated");
      res.redirect(`/profile/${user.id}`);
    } catch (error) {
      console.log(error);
    }
  }
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
      Upload.findOne({ user: "admin" }).then((upload) => {
        console.log(upload);
        console.log(user);
        if (user.plan !== undefined && user.task !== undefined) {
          res.render("task", {
            user: req.user,
            plan: user.plan,
            task: user.totalfunds,
            upload,
          });
        } else {
          res.render("task", {
            user: req.user,
            plan: null,
            task: [],
            upload,
          });
        }
      });
    })
    .catch((err) => console.log(err));
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

//admin logout

router.get("/admin/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/admin/login");
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
          console.log(calcbal);
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

router.get("/admin/upload", ensureAdminAuthenticated, (req, res) => {
  Admin.findOne({ admin: "admin" }).then((admin) => {
    res.render("adminUploadTask", admin);
  });
});

const uploadTask = async (req, res) => {
  const { task1, task2, task3, imgtask1, imgtask2, imgtask3 } = req.body;

  const upload = await Upload.findOne({ user: "admin" });
  try {
    // const upload = new Upload({ task1, task2, task3 });
    // const updatedUpload = await upload.save();
    // req.flash("success_msg", "Task has been successfully uploaded. ");
    //  res.redirect("/admin/upload");
    if (upload) {
      upload.task1 = task1;
      upload.task2 = task2;
      upload.task3 = task3;
      upload.imgtask1 = imgtask1;
      upload.imgtask2 = imgtask2;
      upload.imgtask3 = imgtask3;

      const updatedUpload = await upload.save();

      req.flash("success_msg", "Task has been successfully uploaded. ");
      res.redirect("/admin/upload");
    } else {
      const upload = new Upload({ task1, task2, task3 });
      const updatedUpload = await upload.save();
      req.flash("success_msg", "Task has been successfully uploaded. ");
      res.redirect("/admin/upload");
    }
  } catch (error) {
    console.log(error);
  }
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/");
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}.jpg`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images only!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

var cpUpload = upload.fields([
  { name: "imgtask1", maxCount: 1 },
  { name: "imgtask2", maxCount: 1 },
  { name: "imgtask3", maxCount: 1 },
]);

router.put("/admin/upload", ensureAdminAuthenticated, cpUpload, uploadTask);

const togglewithdrawalbtn = async (req, res) => {
  const togglewithdrawal = !req.body.togglewithdrawal;
  console.log(togglewithdrawal);

  try {
    Admin.findOne({ admin: "admin" }).then((toggle) => {
      toggle.togglewithdrawal = togglewithdrawal;
      toggle.save().then((done) => {
        if (toggle.togglewithdrawal) {
          req.flash("success_msg", "Withdrawal Opened");
        } else {
          req.flash("error_msg", "Withdrawal closed");
        }
        res.redirect("/admin/upload");
      });
    });
  } catch (error) {
    console.log(error);
  }
};

router.post(
  "/admin/togglewithdraw",
  ensureAdminAuthenticated,
  togglewithdrawalbtn
);

router.get("/password", function (req, res) {
  res.render("password", {
    user: req.user,
  });
});

router.get("/reset/:resetLink", function (req, res) {
  const resetLink = req.params.resetLink;
  res.render("reset", {
    resetLink: resetLink,
  });
});

const forgotPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      req.flash("error", "No account with that email address exists.");
      return res.redirect("/password");
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "20m",
    });
    const data = {
      from: "tweetwalletng@gmail.com",
      to: email,
      subject: "Reset Password Link",
      html: `
    <h2>Please click on the given link to reset your password</h2>
    <a href="http://tweetwallet.co/reset/${token}">tweetwallet.co/reset/${token}</a>
    `,
    };

    return user.updateOne({ resetLink: token }, (err, success) => {
      if (err) {
        console.log("reset password link error");
      } else {
        let transporter = nodeMailer.createTransport({
          service: "gmail",
          auth: {
            user: "tweetwalletng@gmail.com",
            pass: "controlroomplja",
          },
        });
        transporter.sendMail(data, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            req.flash(
              "success_msg",
              "An e-mail has been sent to " +
                email +
                " with further instructions."
            );
            res.redirect("/password");
            console.log("Email sent: " + info.response);
          }
        });
      }
    });
  });
};

const resetPassword = (req, res) => {
  const resetLink = req.params.resetLink;
  const { password, password2 } = req.body;
  let errors = [];
  if (resetLink) {
    jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, decoded) => {
      if (err) {
        req.flash("error", "Password reset token is invalid or has expired.");
        res.redirect("password");
      } else {
        //check passwords match
        if (password !== password2) {
          errors.push({ msg: "Passwords do not match" });
        }
        // check pass length
        if (password.length < 6) {
          errors.push({ msg: "Password should be at least 6 characters" });
        }
        if (errors.length > 0) {
          res.render("reset", {
            errors,
            resetLink,
          });
        }
        User.findOne({ resetLink }, (err, user) => {
          if (err || !user) {
            req.flash("error", "User with this token does not exist");
            res.redirect("password");
          }

          //hash password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err;

              //save user
              const obj = {
                password: hash,
              };

              user = _.extend(user, obj);
              user.save((err, result) => {
                if (err) {
                  req.flash("error", "reset password error");
                  res.redirect("password");
                } else {
                  const data = {
                    from: "tweetwalletng@gmail.com",
                    to: user.email,
                    subject: "Your password has been changed",
                    html:
                      "Hello,\n\n" +
                      "This is a confirmation that the password for your account has just been changed.\n",
                  };
                  let transporter = nodeMailer.createTransport({
                    service: "gmail",
                    auth: {
                      user: "tweetwalletng@gmail.com",
                      pass: "controlroomplja",
                    },
                  });
                  transporter.sendMail(data, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      req.flash(
                        "success_msg",
                        "Success! Your password has been changed."
                      );
                      res.redirect("/users/login");
                      console.log("Email sent: " + info.response);
                    }
                  });
                }
              });
            })
          );
        });
      }
    });
  } else {
    console.log("Authentication Error....");
  }
};

//forgot password
router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:resetLink", resetPassword);

module.exports = router;
