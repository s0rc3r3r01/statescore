//Contains simple scoring function for statefull of Node application
var async = require('async'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    memory = require('./memory'),
    colors = require('colors'),
    volume = require('./volume');

exports.version = "0.0.1";
//explicit definition of user, used for variable scope
var user;

//timer function, converts hrtime to ms
function elapsed_time(past) {
    var precision = 3;
    elapsed = process.hrtime(past)[0] * 1000 + process.hrtime(past)[1] / 1000000;
    return elapsed.toFixed(3);
}

//this function
exports.incomingConnectionHandler = function(req, res) {
    async.waterfall([
        function userRecognizer(callback) {
            //only cookie management, no database interaction
            //the logic here is : if the user has a cookie, I trust him as a known user, I do not look him up
            // If he doesn't have a cookie I give him a new one
            if (req.cookies.user) {
                user = req.cookies.user;
                console.log("Returning user with cookie : " + user.yellow);
            } else {
                user = uuid.v4();
                res.cookie("user", user, {
                    "expires": new Date(Date.now() + 100000000)
                });
                console.log("New Incoming User, cookie assigned : " + user.green);
            }
            callback(null, user);
        },
        function userLookup(user, callback) {
            //this function should call the memory, disk, database, lookup for a user and if the user does not exist add him up
            // if he exists, increment the view count
            //timing logic
            var startLookup = process.hrtime();
            //starting with memory
            //checking user existance
            var startlookup = process.hrtime();
            if (memory.checkmemory(user)) {
                console.log("User : " + user + " found in memory".green);
                //add the view and then read the visit number !
                memory.addView(user);
                visitnumber = memory.views(user);
                //assigning score 1 for memory lookup
                score = 1;
            } else {
                console.log("User : " + user + " not found in memory".red);
                //provisional procedure storing the user in memory
                memory.storeUser(user);
                visitnumber = 1;
                score = 0;
                // no the user does not exist in memory, continue lookup
            }
            if (volume.checkvolume(user)) {

            }

            else {

            }







            var lookuptime = elapsed_time(startlookup);
            console.log("The lookup time was : " + lookuptime + " ms " .yellow)
            callback(null, user, visitnumber, lookuptime, score);

        },

    ], function jsonBuilder(err, user, visitnumber, lookuptime, score) {
        var jsonpayload = {
            "score": score,
            "lookuptime": lookuptime,
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
