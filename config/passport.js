const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//load user model
const User = require("../models/User");
const Admin = require("../models/Admin");

module.exports = function (passport) {
  passport.use( "user",
    new LocalStrategy(
      { usernameField: "username" }, 
      (username, password, done) => {
        //match user
        User.findOne({ username: username })
          .then((user) => {
            if (!user) {
              return done(null, false, {
                message: "That Username is not registered",
              });
            }

            //match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, {
                  message: "Password incorrect",
                });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );

passport.use( "admin",
  new LocalStrategy({ usernameField: "admin" }, (admin, password, done) => {
    //match user
    Admin.findOne({ admin: admin })
      .then((admin) => {
        if (!admin) {
          return done(null, false, {
            message: "That admin is not registered",
          });
        }

        //match password
        bcrypt.compare(password, admin.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            return done(null, admin);
          } else {
            return done(null, false, {
              message: "Password incorrect", 
            });
          }
        });
      })
      .catch((err) => console.log(err));
  })
  );
  

function SessionConstructor(userId, userGroup, details) {
  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;
}

passport.serializeUser(function (userObject, done) {
  // userObject could be a Model1 or a Model2... or Model3, Model4, etc.
  let userGroup = "model1";
  let userPrototype = Object.getPrototypeOf(userObject);

  if (userPrototype === User.prototype) {
    userGroup = "model1";
  } else if (userPrototype === Admin.prototype) {
    userGroup = "model2";
  }

  let sessionConstructor = new SessionConstructor(userObject.id, userGroup, "");
  done(null, sessionConstructor);
});

passport.deserializeUser(function (sessionConstructor, done) {
  if (sessionConstructor.userGroup == "model1") {
    User.findOne(
      {
        _id: sessionConstructor.userId,
      },
      "-user.password",
      function (err, user) {
        // When using string syntax, prefixing a path with - will flag that path as excluded.
        done(err, user);
      }
    );
  } else if (sessionConstructor.userGroup == "model2") {
    Admin.findOne(
      {
        _id: sessionConstructor.userId,
      },
      "-admin.password",
      function (err, user) {
        // When using string syntax, prefixing a path with - will flag that path as excluded.
        done(err, user);
      }  
    );
  }
}); 



 
//   passport.serializeUser(function(user, done) { 
//   var key = {
//     id: user.id,
//     type: user.userType
//   }
//   done(null, key);
// })
// passport.deserializeUser(function(key, done) {
//   // this could be more complex with a switch or if statements
//   var Model = key.type === 'type1' ? User : Admin;  
//   Model.findOne({
//     _id: key.id
//   }, '-salt -password', function(err, user) {
//     done(err, user);  
//   })
// })

//   passport.serializeUser(function (user, done) {
//     if (isUser(user)) {
//       done(null, "user_" + user.id);
//     } else if (isAdmin(user)) {
//          done(null, "manager_" + user.id);
//  }
 
//   });

//   passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//       done(err, user);
//     });
//   });
  
//    passport.deserializeUser(function (id, done) {
//      Admin.findById(id, function (err, user) {
//        done(err, user);
//      });
//    });
};
