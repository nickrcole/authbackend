"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsModules_js_1 = require("./jsModules.js");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
mongoose.connect("mongodb://localhost:27017/auth", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
});
const User = new mongoose.model("User", userSchema);
app.get("/user", function (req, res) {
  const authToken = req.get("authToken");
  const authEmail = req.get("authEmail");
  const userID = req.get("userID");
});
app.post("/register", function (req, res) {
  let email = req.body.email.toLowerCase();
  (0, jsModules_js_1.log)("register request for address " + email);
  User.findOne({ email: email }, function (err, foundUser) {
    if (foundUser) {
      (0, jsModules_js_1.log)("request denied: user already exists");
      res.json({
        success: false,
        exists: true,
        token: "noToken",
        error: "userExists",
      });
    } else {
      (0, jsModules_js_1.log)("sucessful request: attempting to register user");
      bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        const newUser = new User({
          email: email,
          password: hash,
        });
        newUser.save(function (err) {
          if (err) {
            (0, jsModules_js_1.log)(
              "saving user to database failed with error" + err
            );
            res.redirect("/register");
          } else {
            const authToken = generateAuthToken();
            saveSession(email, authToken);
            (0, jsModules_js_1.log)(
              "successfully registered user: returning success object"
            );
            res.json({
              success: true,
              exists: false,
              token: authToken,
              error: "noError",
            });
          }
        });
      });
    }
  });
});
app.post("/validateSession", function (req, res) {
  let email = req.body.email.toLowerCase();
  let token = req.body.password;
  (0,
  jsModules_js_1.log)("validation request for address " + email + " with token " + token);
  if (email == undefined) {
    (0, jsModules_js_1.log)("unable to parse email and token");
    res.json({
      success: false,
      exists: false,
      token: "noToken",
      error: "cannotParseToken",
    });
  } else if (activeSessions[email] == token) {
    (0, jsModules_js_1.log)("session authenticated");
    res.json({ success: true, exists: false, token: token, error: "noError" });
  } else {
    (0, jsModules_js_1.log)("session not authenticated");
    res.json({
      success: false,
      exists: false,
      token: "noToken",
      error: "noTokenInSessions",
    });
  }
});
app.post("/login", function (req, res) {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  (0, jsModules_js_1.log)("recieved login request for user " + email);
  User.findOne({ email: email }, function (err, foundUser) {
    if (err) {
      (0, jsModules_js_1.log)(err);
      res.redirect("/login");
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result == true) {
            const authToken = generateAuthToken();
            saveSession(email, authToken);
            (0, jsModules_js_1.log)(
              "successfully logged in user: returning success object"
            );
            res.json({
              success: true,
              exists: true,
              token: authToken,
              error: "noError",
            });
          } else {
            (0, jsModules_js_1.log)(
              "user " + email + " login attempt failed: incorrect password"
            );
            res.json({
              success: false,
              exists: true,
              token: "noToken",
              error: "incorrectPassword",
            });
          }
        });
      } else {
        (0, jsModules_js_1.log)(
          "user " + email + " login attempt failed: user doesn't exist"
        );
        res.json({
          success: false,
          exists: false,
          token: "noToken",
          error: "noExistingUser",
        });
      }
    }
  });
});
var activeSessions = {};
function generateAuthToken() {
  return Math.random().toString(16);
}
function authenticateToken(authToken) {
  if (authToken in activeSessions) {
    return true;
  }
  return false;
}
function saveSession(email, authToken) {
  activeSessions[email] = authToken;
}
//Creates the string to log requests in the console
// function log(log: String) {
//     var timeStamp = getTime();
//     console.log(timeStamp + log)
// }
// //Fetches the current time
// function getTime() {
//     var today = new Date();
//     return "[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + "]: ";
// }
let port = process.env.PORT;
let portNum;
if (port == null || port == "") {
  portNum = 3000;
} else {
  portNum = +port;
}
app.listen(portNum, function () {
  (0, jsModules_js_1.log)("Server started on port " + portNum);
});
