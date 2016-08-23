//Contains simple scoring function for statefull of Node application
var async = require('async'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    memory = require('./memory'),
    colors = require('colors'),
    database = require('./database'),
    disk = require('./disk'),
    tsv = require('./tsv'),
    logger = require('./logger'),
    os = require('os');


exports.version = "0.0.3";
//explicit definition of user, used for variable scope

var realuser,
    lookuptime = 0,
    memoryStore = {
        memory: false,
        disk: false,
        database: false
    };

// payload reading, using Sync function for specific time purposes
var payload;
fs.readFile('../payload', 'utf8', function(err, data) {
    if (err) {
        return console.log(err);
    }
    payload = data;
});

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
                    realuser = req.cookies.user;
                    logger.logEvent({
                        'message': 'Returning user with cookie :' + realuser,
                        'user': realuser
                    });
                } else {
                    realuser = uuid.v4();
                    res.cookie("user", realuser, {
                        "expires": new Date(Date.now() + 100000000)
                    });
                    logger.logEvent({
                        'message': 'New Incoming User, cookie assigned : ' + realuser,
                        'user': realuser
                    });
                }
                //now generating new user with payload
                payloadeduser = realuser + payload;
                callback(null, realuser, payloadeduser);
            },
            function userLookup(realuser, payloadeduser, callback) {
                //this function should call the memory, disk, database, lookup for a user and if the
                // user does not exist add him up; if he exists, increment the view count
                //starting timer
                var startLookup = process.hrtime(),
                    //assigning default to visitnumber
                    visitnumber = null,
                    score = 0;

                if (memory.checkmemory(payloadeduser)) {
                    //add the view and then read the visit number !
                    memory.addView(payloadeduser);
                    visitnumber = memory.countViews(payloadeduser);
                    //assigning score 1 for memory lookup
                    score = 1;
                    lookuptime = elapsed_time(startLookup);
                    logger.logEvent({
                        'store': 'memory',
                        'message': 'User Found in memory ' + realuser + ' the lookup time was ' + lookuptime,
                        'user': realuser,
                        'found': 'true',
                        'score': score,
                        'visitnumber': visitnumber,
                        'lookuptime': lookuptime
                    });
                    //
                    return callback(null, realuser, payloadeduser, visitnumber, lookuptime, score);
                    console.log ("past callback");
                } else {
                    console.log("User NOT found in memory " + realuser.yellow);
                }
                // no the user does not exist in memory, continue lookup

                if (disk.checkDisk(payloadeduser)) {
                    visitnumber = disk.countViews(payloadeduser);
                    disk.addView(payloadeduser);
                    //assigning score 2 for disk lookup
                    score = 2
                    lookuptime = elapsed_time(startLookup);
                    logger.logEvent({
                        'store': 'disk',
                        'message': 'User found in disk ' + realuser + ' the lookup time was ' + lookuptime,
                        'user': realuser,
                        'found': 'true',
                        'score': score,
                        'visitnumber': visitnumber,
                        'lookuptime': lookuptime
                    });
                    return callback(null, realuser, payloadeduser, visitnumber, lookuptime, score);
                } else {

                    console.log("User NOT found in disk " + realuser.yellow);
                }


                database.checkDatabase(payloadeduser, function(err, reply) {
                    if (reply) {
                        database.addView(payloadeduser, function getVisits(err, reply) {
                            if (err) {
                                logger.logEvent({
                                    'store': 'database',
                                    'message': 'Database error surfaced ',
                                    'user': realuser,
                                    'level': 'error'
                                });
                            }
                            visitnumber = reply;
                            //assigning score 4 for database lookup
                            score = 4
                            lookuptime = elapsed_time(startLookup);
                            logger.logEvent({
                                'store': 'database',
                                'message': 'User found in database ' + realuser + ' the lookup time was ' + lookuptime,
                                'user': realuser,
                                'found': 'true',
                                'score': score,
                                'visitnumber': visitnumber,
                                'lookuptime': lookuptime
                            });
                            return callback(null, realuser, payloadeduser, visitnumber, lookuptime, score);
                        });
                    } else {
                        //user not found in the database nor anywhere, assigning score zero
                        var lookuptime = elapsed_time(startLookup);
                        logger.logEvent({
                            'store': 'database',
                            'message': 'User not even found in database ' + realuser + ' the complete lookup time was ' + lookuptime,
                            'user': realuser,
                            'found': 'false',
                            'score': score,
                            'lookuptime': lookuptime
                        });
                        return  callback(null, realuser, payloadeduser, visitnumber, lookuptime, score);
                    }
                });
            },
            //the logic here is that the application should perform a lookup for the user first and then store it if some options are enabled
            // because of the way Node works, it means that some variables need to be passed to the next function, as they area
            function userAdd(realuser, payloadeduser, visitnumber, lookuptime, score, callback) {
                // execute only if the score is 0 and the user is not available anywhere
                if (score === 0) {
                    if (memoryStore.memory == "true") {
                        memory.storeUser(payloadeduser);
                        console.log("user stored in memory: " + realuser.yellow);

                    }
                    if (memoryStore.disk == "true") {
                        disk.storeUser(payloadeduser);
                        console.log("user stored in disk: " + realuser.yellow);

                    }
                    if (memoryStore.database == "true") {
                        database.storeUser(payloadeduser);
                        console.log("user stored in database: " + realuser.yellow);

                    }
                    visitnumber = 1;
                    callback(null, realuser, payloadeduser, visitnumber, lookuptime, score);
                }
                callback(null, realuser, payloadeduser, visitnumber, lookuptime, score);
            }

        ],
        function jsonBuilder(err, realuser, payloadeduser, visitnumber, lookuptime, score) {
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
                "user": realuser,
                "visitnumber": visitnumber,
                "containerid": os.hostname(),
                "machineid": process.env.HOST_HOSTNAME
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
