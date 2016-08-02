var Logstash = require('logstash-client'),
    colors = require('colors');

exports.version = "0.0.1";


var logstash = new Logstash({
    type: 'tcp', // udp, tcp, memory
    host: 'localhost',
    port: 9000
});


exports.logEvent = function(obj, callback) {
obj.@timestamp = new Date();
obj.containerid = process.env.hostname;
obj.machineid = process.env.host_hostname;
logstash.send(obj);
if (obj.level == 'error') {
    console.log(obj.message   .red);
} else {
    console.log(obj.message);
}
if (err) {
    console.error("REDIS ERROR".red);
    callback(err);
}
console.log("views for user incremented " + user.yellow);
callback(null, reply);
});
}
