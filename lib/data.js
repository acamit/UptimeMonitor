/*
 * Library for story and editing data
 *
 */

var fs = require('fs');
var path = require('path'); //normalize paths to different directories


//Container for the module (to be exported)
var lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data'); // take these 2 locations and jump back 1 dir and enter data directory and return a basic path
//write data to a file
lib.create = function (dir, file, data, callback) {
    //open the file for writing
    fs.open(`${lib.baseDir}\\${dir}\\${file}.json`, 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            //convert data to string
            var stringData = JSON.stringify(data);

            //write to file and close it
            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false); //no error
                        } else {
                            callback('Error Closing the file')
                        }
                    });
                } else {
                    callback('Error writing to new file.');
                }
            });
        } else {
            callback('Could not create a new file, it may already exist');
        }
    });
}


//read data from file
lib.read = function (dir, file, callback) {
    fs.readFile(`${lib.baseDir}\\${dir}\\${file}.json`, 'utf-8', function (err, data) {
        callback(err, data);
    })
}

//update(Override) the data inside the file
lib.update = function (dir, file, data, callback) {
    //open the file for updating
    fs.open(`${lib.baseDir}\\${dir}\\${file}.json`, 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            //convert data to string
            var stringData = JSON.stringify(data);

            // truncate the file
            fs.truncate(fileDescriptor, function (err) {
                if (!err) {
                    //Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing the file');
                                }
                            })
                        } else {
                            callback('Error Writing to existing file')
                        }
                    })
                } else {
                    callback('Error truncating the file');
                }
            })
        } else {
            callback('Could not open the file for update, it may not exist');
        }
    });
}

//delete a file
lib.delete = function(dir, file, callback){
    //unlink the file
    fs.unlink(`${lib.baseDir}\\${dir}\\${file}.json`, function(err){
        if(!err){
            callback(false);
        }else{
            callback('Error deleting file');
        }
    })
}

//export the module
module.exports = lib;