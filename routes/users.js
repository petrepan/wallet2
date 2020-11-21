const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");

//user model
const User = require("../models/User");

//login page
router.get("/login", (req, res) => {
  res.render("login");
});

//register
router.get("/register", (req, res) => {
  res.render("register");
});

//Register handle
router.post("/register", (req, res) => {
  const {
    fullname,
    username,
    number,
    accountname,
    accountnumber,
    accountbank,
    email,
    password,
    password2,
  } = req.body;
  username.trim();

  let errors = [];
  //check required fields
  if (
    !fullname ||
    !username ||
    !number ||
    !accountname ||
    !accountnumber ||
    !accountbank ||
    !password ||
    !password2
  ) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      fullname,
      username,
      number,
      accountname,
      accountnumber,
      accountbank,
      password,
      password2,
    });
  } else {
    //Validation pass
    User.find()
    .or([{ username: username},{ email:email }])
    .then((user) => {
      if (user) {
        //user exist
        errors.push({ msg: "Username or email  already taken" });
        res.render("register", {
          errors,
          fullname,
          username,
          number,
          accountname,
          accountnumber,
          accountbank,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          fullname,
          username,
          number,
          accountname,
          accountnumber,
          accountbank,
          email,
          password,
        });
        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set password to hash
            newUser.password = hash;
            //save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can login"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Login handle
router.post("/login", (req, res, next) => {
  passport.authenticate("user", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
