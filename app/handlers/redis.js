//module to interact with Redis backend server
var redis = require('redis'),
    async = require('async'),
    colors = require('colors');

exports.version = "0.0.1";

//creating client
var client = redis.createClient();

client.on('connect', function() {
    console.log('REDIS connected'.yellow);
});

exports.storeUser = function(user) {
    client.set(user, '1', function(err, reply) {
        if (err) {
            console.error("REDIS ERROR".red);
            return;
        }
        console.log("USER stored in REDIS " + user.yellow);
    });
}

exports.countViews = function(user) {
    client.get(user, function(err, reply) {
        if (err) {
            console.error("REDIS ERROR".red);
            callback(err);
        }
        console.log("view count for user " + user.yellow);
        callback (null, reply);
    });
}
exports.addView = function(user,callback) {
    client.incr(user, function(err, reply) {
        if (err) {
            console.error("REDIS ERROR".red);
            callback(err);
        }
        console.log("views for user incremented " + user.yellow);
        callback(null, reply);
    });
}

exports.checkRedis = function(user, callback) {
    client.exists(user, function(err, reply) {
        if (err) {
            console.error("REDIS ERROR".red);
            return;
        }
        if (reply === 1) {
            console.error("user in redis, from redis.js" .yellow);
            callback(null, true);
        } else {

              console.error("user NOT in redis, from redis.js" .yellow);
            callback (null, false);
        }
    });
}
