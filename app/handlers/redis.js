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
                    console.err("REDIS ERROR".red);
                    return;
                }
                console.log("USER stored in REDIS " + user.yellow);
            };
        }

        exports.countViews = function(user) {
            client.get(user, function(err, reply) {
                if (err) {
                    console.err("REDIS ERROR".red);
                    return;
                }
                console.log("view count for user " + user.yellow);
                return reply;
            });
        }
        exports.addView = function(user) {
            client.incr(user, function(err, reply) {
                if (err) {
                    console.err("REDIS ERROR".red);
                    return;
                }
                console.log("views for user incremented " + user.yellow); //
            });
        }

        exports.checkRedis = function(user) {
            client.exists(user, function(err, reply) {
                if (err) {
                    console.err("REDIS ERROR".red);
                    return;
                }
                if (reply === 1) {
                    return true;
                } else {
                      return false;
                }
            });
        }
