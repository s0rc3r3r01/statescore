//Contains simple scoring function for statefull of Node application
var async = require('async'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    colors = require('colors');

exports.version = "0.0.1";
//explicit definition of user, used for variable scope
var user;

function score(req, res) { //inital version no logic

};

//this function
exports.incomingConnectionHandler = function(req, res) {
  async.waterfall([
    function userRecognizer (callback) {
      //only cookie management, no database interaction
      //the logic here is : if the user has a cookie, I trust him as a known user, I do not look him up
      // If he doesn't have a cookie I give him a new one
      if (req.cookies.user) {
          user = req.cookies.user;
          console.log("Returning user with cookie : " + user    .yellow);
      } else {
          user = uuid.v4();
          res.cookie("user", user, {
              "expires": new Date(Date.now() + 100000000)
          });
          console.log("New Incoming User, cookie assigned : " + user    .green);
      }
      callback(null, user);
    },
    function userHandler (user, callback) {
      //this function should call the memory, disk, database, lookup for a user and if the user does not exist add him up
      // if he exists, increment the view count
      var visitnumber = 3
      var score = 1
      callback(null, user, visitnumber, score);
    },

], function jsonBuilder(err, user, visitnumber, score) {
  var jsonpayload = {
      "score": score,
      "description": "containssss",
      "user": user,
      "visitnumber": visitnumber
  }
  var output = {
      error: null,
      data: jsonpayload
  };
  res.writeHead(200, {
      "Content-Type": "application/json"
  });
  res.end(JSON.stringify(output) + "\n");
});
};
