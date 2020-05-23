const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth")

//home page
router.get('/', (req, res) => 
    res.render("welcome")
);

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

//dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    username: req.user.username,
    accountnumber: req.user.accountnumber,
    accountbank: req.user.accountbank,
  })
);

//profile


module.exports = router;