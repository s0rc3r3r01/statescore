//this file contains the functions to interact with memory
//Contains simple scoring function for statefull of Node application
var async = require('async'),
    colors = require('colors'),
    fs = require('fs');

exports.version = "0.0.1";


//because of the way a File is made, I assume that the file is read ONCE, then written if needed and
// then closed, I assume this to happen all the time this lookup is made,even if on a strict situation
//this would probably not be the case as the contents of the file would be loaded in memory and access from there
// and all the calls are made synchronously to get a proper timing
exports.checkDisk = function(user) {
    try {
        var file = fs.readFileSync('../userlist/users', 'utf8');
    } catch (e) {
        console.log(e.red);
        return (false);
    }
    if (file.indexOf(user) > -1) {
        return true;
    } else {
        return false;
    }
}

exports.countViews = function(user) {
    try {
        var file = fs.readFileSync('../userlist/users', 'utf8');
    } catch (e) {
        console.log(e.red);
        return (false);
    }
    //variable containing the number of initial position of the number with the views
    var viewposition = file.indexOf(user) + user.length + 1;
    var views = file.substring(viewposition, viewposition+4);
    return views;
}

exports.storeUser = function(user) {
    try {
        fs.appendFileSync('../userlist/users', user + ":1", 'utf8');
    } catch (e) {
        console.error(e.red);
    }
}

exports.addView = function(user) {
    try {
        var file = fs.readFileSync('../userlist/users', 'utf8');
    } catch (e) {
        console.log(e.red);
        return (false);
    }
    //variable containing the number of initial position of the number with the views
    var viewposition = file.indexOf(user) + user.length + 1;
    var views = file.substring(viewposition, viewposition+4);
    //variable containing an integer with the number of views+1
    var plus1 = parseInt(views) + 1;
    //new string variable containing the whole file with the view updated
    file = file.replace(user + ":" + views, user + ":" + plus1);
    //writing the file to disk
    fs.writeFileSync('../userlist/users', file, 'utf8');
}
