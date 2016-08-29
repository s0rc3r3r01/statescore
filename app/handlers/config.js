// using environment variables to change database connection

exports.version = "0.0.2";

exports.databasehost = function() {
    if (process.env.REDISHOST) {
        return process.env.REDISHOST;
    } else {
        return "localhost";
    }
}

exports.databaseport = function() {
    if (process.env.REDISPORT) {
        return process.env.REDISPORT;
    } else {
        return "6379";
    }

}
