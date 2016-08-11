//this file contains the functions to interact with memory
//Contains simple scoring function for statefull of Node application
var async = require('async'),
    colors = require('colors');

exports.version = "0.0.1";


var simplememory = {default:1 } ;
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
}

exports.countViews = function(user) {
    return simplememory[user];
}

exports.addView = function(user) {
    simplememory[user]++;
}
