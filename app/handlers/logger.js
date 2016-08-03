var Logstash = require('logstash-client'),
    colors = require('colors'),
    os = require('os');

exports.version = "0.0.1";


var logstash = new Logstash({
    type: 'tcp', // udp, tcp, memory
    host: 'localhost',
    port: 9000
});


exports.logEvent = function(obj, callback) {
    obj.timestamp = new Date();
    obj.containerid = os.hostname();
    obj.machineid = process.env.HOST_HOSTNAME;
    console.log("process.env.HOST_HOSTNAME "+process.env.HOST_HOSTNAME);
    logstash.send(obj);
    if (obj.level == 'error') {
        console.log(obj.message.red);
    } else {
        console.log(obj.message);
    }
}
