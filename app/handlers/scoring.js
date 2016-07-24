//Contains simple scoring function for statefull of Node application
var async = require('async'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    memory = require('./memory'),
    colors = require('colors'),
    database = require('./database'),
    disk = require('./disk'),
    tsv = require('./tsv');

exports.version = "0.0.1";
//explicit definition of user, used for variable scope
var user;

var memoryStore = {
    memory: false,
    disk: false,
    database: false
};

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
            console.log(memoryStore);
            //only cookie management, no database interaction
            //the logic here is : if the user has a cookie, I trust him as a known user, I do not
            // look him up.  If he doesn't have a cookie I give him a new one. I assume a well-behaved
            // user.
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
            //this function should call the memory, disk, database, lookup for a user and if the
            // user does not exist add him up; if he exists, increment the view count
            //starting with memory
            //startin timer
            var startLookup = process.hrtime();
            if (memory.checkmemory(user)) {
                console.log("User : " + user + " found in memory".green);
                //add the view and then read the visit number !
                memory.addView(user);
                visitnumber = memory.countViews(user);
                //assigning score 1 for memory lookup
                score = 1;
                callback(null, user, visitnumber, lookuptime, score);
            } else {
                console.log("User : " + user + " not found in memory".red);
                // no the user does not exist in memory, continue lookup
            }

            if (disk.checkDisk(user)) {
                console.log("User : " + user + " found in disk".green);
                visitnumber = disk.countViews(user);
                disk.addView(user);
                //assigning score 2 for disk lookup
                score = 2
                callback(null, user, visitnumber, lookuptime, score);
            } else {
                console.log("User : " + user + " not found in disk".red);
            }
            database.checkDatabase(user, function(err, reply) {
                if (reply) {
                    console.log("User : " + user + " found in database".green);
                    database.addView(user, function getVisits(err, reply) {
                        if (err) {
                            console.error("database error surfaced");
                        }
                        visitnumber = reply;
                        //assigning score 4 for database lookup
                        score = 4
                        var lookuptime = elapsed_time(startLookup);
                        console.log("We have got to the database and the lookup time was : " + lookuptime + " ms "
                            .yellow);
                        callback(null, user, visitnumber, lookuptime, score);
                    });

                } else {
                  console.log("User : " + user + " not found in database".red);
                    //the last scorer if all the others have failed will assigne a score of 0
                    score = 0;
                    var lookuptime = elapsed_time(startLookup);
                    console.log("We have got to database and the lookup time was : " + lookuptime + " ms "
                        .yellow);
                    callback(null, user, visitnumber, lookuptime, score);
                }
            });
        }

        //the logic here is that the application should perform a lookup for the user first and then store it if some options are enabled
        // because of the way Node works, it means that some variables need to be passed to the next function, as they area
        function userAdder(err, user, visitnumber, lookuptime, score ) {
        // execute only if the score is 0 and the user is not available anywhere
          if (score == 0) {
            if (memoryStore.memory) {memory.storeUser(user);}
            if (memoryStore.disk) {disk.storeUser(user); }
            if (memoryStore.database) {database.storeUser(user);}


                            visitnumber = 1;
          }
        }

    ], function jsonBuilder(err, user, visitnumber, lookuptime, score) {
        //tsv generation and append, synchronously
        var generatedtsv = tsv.stringify([{
            id: visitnumber,
            name: lookuptime
        }]);
        fs.appendFileSync('../static/content/data.tsv', generatedtsv, 'utf8');
        var jsonpayload = {
            "score": score,
            "lookuptime": lookuptime,
            "description": "containssss",
            "user": user,
            "visitnumber": visitnumber
        };

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

exports.memoryStoreManager = function(req, res, callback) {

    //there is no need for a switch statement as the selection is "one off" and not per user
    if (req.query.memory) {
        memoryStore.memory = req.query.memory;
        console.log("setting memory to ".magenta + req.query.memory.magenta);
        callback(null);
    } else if (req.query.disk) {
        memoryStore.disk = req.query.disk;
        console.log("setting disk to ".magenta + req.query.disk.magenta);
        callback(null);
    } else if (req.query.database) {
        memoryStore.database = req.query.database;
        console.log("setting database to ".magenta + req.query.database.magenta);
        callback(null);
    } else {
        console.log("Wrong admin command received !".red);
        callback(true);
    }
}
