//module to interact with Redis backend server
var redis = require('redis'),
    async = require('async'),
    colors = require('colors'),
    config = require('./config');

exports.version = "0.0.1";

//creating client
var client = redis.createClient(config.databaseport(), config.databasehost());

client.on('connect', function() {
    console.log('REDIS connected'.yellow)
    console.log ('REDIS on host : ' + config.databasehost() + ' and on ' + config.databaseport());
});

// structure common to all the storage management handlers
exports.storeUser = function(user) {
    client.set(user, '1', function(err, reply) {
        if (err) {
            console.error("REDIS ERROR".red);
            return;
        }
    });
}

exports.countViews = function(user) {
    client.get(user, function(err, reply) {
        if (err) {
            console.error("REDIS ERROR".red);
            callback(err);
        }
        callback (null, reply);
    });
}
exports.addView = function(user,callback) {
    client.incr(user, function(err, reply) {
        if (err) {
            console.error("REDIS ERROR".red);
            callback(err);
        }
        callback(null, reply);
    });
}
//assuming node convention of error as first parameter
exports.checkDatabase = function(user, callback) {
    client.exists(user, function(err, reply) {
        if (err) {
            console.error("REDIS ERROR".red);
            return;
        }
        if (reply === 1) {
            callback(null, true);
        } else {
            callback (null, false);
        }
    });
}
