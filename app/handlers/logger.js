//this file contains the loggin functions used in statescore

var Logstash = require('logstash-client'),
    colors = require('colors'),
    os = require('os');

exports.version = "0.0.1";


var logstash = new Logstash({
    type: 'tcp', // udp, tcp, memory
    host: 'localhost',
    port: 9000
});

//outputs on console and on logstash
exports.logEvent = function(obj, callback) {
    obj.timestamp = new Date();
    obj.containerid = os.hostname();
    obj.machineid = process.env.HOST_HOSTNAME;
    logstash.send(obj);
    if (obj.level == 'error') {
        console.log(obj.message.red);
    } else {
        console.log(obj.message);
    }
}
