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
var file =

// I want the checkmemory function to be separated to be able to obtain the results and check somewhere else
exports.checkmemory = function(user) {
    if (typeof simplememory[user] === 'undefined') {
        return false;
    } else {
        return true;
    }

}

exports.storeUser = function(user) {
// THIS NEEDS TO BE BRACKET NOTATION
  simplememory[user] = 1;
  console.log ("stored user: " + user .yellow);
}

exports.views = function(user) {
    return simplememory[user];
}

exports.addView = function(user) {
    simplememory[user]++;
    console.log ("views increcmented for " + user .yellow);
}
