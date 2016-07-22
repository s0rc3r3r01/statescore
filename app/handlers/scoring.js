//Contains simple scoring function for statefull of Node application
var async = require('async'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    memory = require('./memory'),
    colors = require('colors'),
    redis = require('./redis'),
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
            //starting with memory
            var startLookup = process.hrtime();
            //checking user existance
            /*
            if (memory.checkmemory(user)) {
                console.log("User : " + user + " found in memory".green);
                //add the view and then read the visit number !
                memory.addView(user);
                visitnumber = memory.countViews(user);
                //assigning score 1 for memory lookup
                score = 1;
            } else {
                console.log("User : " + user + " not found in memory".red);
                memory.storeUser(user);
                //provisional procedure storing the user in memory
                // no the user does not exist in memory, continue lookup
            }

            if (volume.checkDisk(user)) {
                console.log("User : " + user + " found in file".green);
                volume.addView(user);
                visitnumber = volume.countViews(user);
                //assigning score 2 for disk lookup
                score = 2
            } else {
                console.log("User : " + user + " not found in file".red);
                volume.storeUser(user);
                visitnumber = 1;
                score = 0;
            }
            */
            redis.checkRedis(user, function(err, reply) {
                    if (reply) {
                        console.log("User : " + user + " found in Redis".green);
                        redis.addView(user, function getVisits(err, reply) {
                        if (err) {
                          console.error("REDIS error surfaced");
                        }
                        visitnumber=reply;
                        //assigning score 4 for database lookup
                        score = 4
                        var lookuptime = elapsed_time(startLookup);
                        console.log("We have got to Redis and the lookup time was : " + lookuptime + " ms ".yellow);
                        callback(null, user, visitnumber, lookuptime, score);
                      });

                    } else {
                        console.log("User : " + user + " not found in Redis".red);
                        redis.storeUser(user);
                        visitnumber = 1;
                        score = 0;
                        var lookuptime = elapsed_time(startLookup);
                        console.log("We have got to Redis and the lookup time was : " + lookuptime + " ms ".yellow);
                        callback(null, user, visitnumber, lookuptime, score);
                    }
                });

              }

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
