//Contains simple scoring function for statefull of Node application
var async = require('async'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    memory = require('./memory'),
    colors = require('colors'),
    database = require('./database'),
    disk = require('./disk'),
    tsv = require('./tsv'),
    logger = require('./logger');


exports.version = "0.0.3";
//explicit definition of user, used for variable scope

var user,
    memoryStore = {
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
            //only cookie management, no database interaction
            //the logic here is : if the user has a cookie, I trust him as a known user, I do not
            // look him up.  If he doesn't have a cookie I give him a new one. I assume a well-behaved
            // user.
            if (req.cookies.user) {
                user = req.cookies.user;
                logger.logEvent({
                    'message': 'Returning user with cookie :' + user,
                    'user': user
                });
            } else {
                user = uuid.v4();
                res.cookie("user", user, {
                    "expires": new Date(Date.now() + 100000000)
                });
                logger.logEvent({
                    'message': 'New Incoming User, cookie assigned : ' + user,
                    'user': user
                });
            }
            callback(null, user);
        },
        function userLookup(user, callback) {
            //this function should call the memory, disk, database, lookup for a user and if the
            // user does not exist add him up; if he exists, increment the view count
            //starting timer
            var startLookup = process.hrtime();
            //assigning default to visitnumber
            visitnumber = null;
            score = null;

            if (memory.checkmemory(user)) {
                //add the view and then read the visit number !
                memory.addView(user);
                visitnumber = memory.countViews(user);
                //assigning score 1 for memory lookup
                score = 1;
                var lookuptime = elapsed_time(startLookup);
                logger.logEvent({
                    'store': 'memory',
                    'message': 'User Found in memory ' + user + ' the lookup time was ' + lookuptime,
                    'user': user,
                    'found': 'true',
                    'score': score,
                    'lookuptime': lookuptime
                });
            } else {
                logger.logEvent({
                    'store': 'memory',
                    'message': 'User NOT Found in memory ' + user,
                    'user': user,
                    'found': 'false'
                });
                // no the user does not exist in memory, continue lookup
            }

            if (disk.checkDisk(user)) {
                visitnumber = disk.countViews(user);
                disk.addView(user);
                //assigning score 2 for disk lookup
                score = 2
                var lookuptime = elapsed_time(startLookup);
                logger.logEvent({
                    'store': 'disk',
                    'message': 'User found in disk ' + user + ' the lookup time was ' + lookuptime,
                    'user': user,
                    'found': 'true',
                    'score': score,
                    'lookuptime': lookuptime
                });
            } else {

                logger.logEvent({
                    'store': 'disk',
                    'message': 'User NOT Found in disk ' + user,
                    'user': user,
                    'found': 'false'
                });
            }
            database.checkDatabase(user, function(err, reply) {
                if (reply) {
                    database.addView(user, function getVisits(err, reply) {
                        if (err) {
                            logger.logEvent({
                                'store': 'database',
                                'message': 'Database error surfaced ',
                                'user': user,
                                'level': 'error'
                            });
                        }
                        visitnumber = reply;
                        //assigning score 4 for database lookup
                        score = 4
                        var lookuptime = elapsed_time(startLookup);
                        logger.logEvent({
                            'store': 'database',
                            'message': 'User found in database ' + user + ' the lookup time was ' + lookuptime,
                            'user': user,
                            'found': 'true',
                            'score': score,
                            'lookuptime': lookuptime
                        });
                        callback(null, user, visitnumber, lookuptime, score);
                    });
                } else {
                    var lookuptime = elapsed_time(startLookup);
                    logger.logEvent({
                        'store': 'database',
                        'message': 'User not even found in database ' + user + ' the complete lookup time was ' + lookuptime,
                        'user': user,
                        'found': 'false',
                        'score': 0,
                        'lookuptime': lookuptime
                    });
                    callback(null, user, visitnumber, lookuptime, score);
                }
            });
        },
        //the logic here is that the application should perform a lookup for the user first and then store it if some options are enabled
        // because of the way Node works, it means that some variables need to be passed to the next function, as they area
        function userAdd(user, visitnumber, lookuptime, score, callback) {
            // execute only if the score is 0 and the user is not available anywhere
            if (score == null) {
                if (memoryStore.memory) {
                    memory.storeUser(user);
                }
                if (memoryStore.disk) {
                    disk.storeUser(user);
                }
                if (memoryStore.database) {
                    database.storeUser(user);
                }
                visitnumber = 1;
                callback(null, user, visitnumber, lookuptime, score);
            }
            callback(null, user, visitnumber, lookuptime, score);
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
    } else if (req.query.users) {
        var generatedtsv = tsv.stringify([{
            id: "id",
            name: "name"
        }]);
        fs.writeFileSync('../static/content/data.tsv', generatedtsv, 'utf8');
        console.log("Deleting users from UI tsv file ".magenta);
        callback(null);
    } else {
        console.log("Wrong admin command received !".red);
        callback(true);
    }
}
