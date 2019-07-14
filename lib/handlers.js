/*
 * Request Handlers
 *
 */

//dependencies
var _data = require('./data');
var helpers = require('./helpers');

//Define Handlers
var handlers = {};

//ping handler
handlers.ping = function (data, callback) {
    //callback a http status code and a payload object
    callback(200)
};
//Not found handler
handlers.notFound = function (data, callback) {
    callback(404)
};

handlers.users = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405)
    }
}

//conainter for users submethods
handlers._users = {}
//Users - post
//Required data : firstname, lastName, phone, password, tosAgreement
handlers._users.post = function (data, callback) {
    //check all required fields are filled out

    var firstName = typeof (data.payload.firstname) == 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
    var lastName = typeof (data.payload.lastname) == 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    if (firstName && lastName && password && phone && tosAgreement) {
        //Make sure that user doesn't already exist
        _data.read('users', phone, function (err, data) {
            if (err) {
                //Hash the password
                var hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': tosAgreement
                    };
                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200, {
                                'success': 'user created'
                            });
                        } else {
                            console.log(err);
                            callback(500, {
                                'Error': 'Could not create the new user'
                            });
                        }
                    });
                } else {
                    callback(500, {
                        'Error': 'Could not hash the user password'
                    });
                }
            } else {
                callback(400, {
                    'Error': 'User with that phone number already exist'
                });
            }
        });
    } else {
        callback(400, {
            "Error": "Missing required fields"
        });
    }
}

//Users - get
handlers._users.get = function (data, callback) {
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        // Lookup the user
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                // Remove the hashed password from the user user object before returning it to the requester
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required field'
        })
    }

}

//Users - put
handlers._users.put = function (data, callback) {
    // Check for required field
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for optional fields
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    // Update the fields if necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // Store the new updates
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                'Error': 'Could not update the user.'
                            });
                        }
                    });
                } else {
                    callback(400, {
                        'Error': 'Specified user does not exist.'
                    });
                }
            });
        } else {
            callback(400, {
                'Error': 'Missing fields to update.'
            });
        }
    } else {
        callback(400, {
            'Error': 'Missing required field.'
        });
    }

}

// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function (data, callback) {
    // Check that phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        // Lookup the user
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                _data.delete('users', phone, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            'Error': 'Could not delete the specified user'
                        });
                    }
                });
            } else {
                callback(400, {
                    'Error': 'Could not find the specified user.'
                });
            }
        });
    } else {
        callback(400, {
            'Error': 'Missing required field'
        })
    }
};



module.exports = handlers;