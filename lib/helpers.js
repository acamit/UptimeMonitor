/*
*helpers for general tasks
*
*/
var crypto = require('crypto');
var config = require('./config');
var helpers = {};

//create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str)==='string' && str.length>0){
        var hash = crypto.createHash('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }else{
        return false;
    }
}

//parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
}



module.exports = helpers;