/*
 *create and export configuration variables
**/

// Container for all the environments
var environments = {};

//staging (default) environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret':'thisIsASecret'
};

//production environment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret':'thisIsASecret'
}

//Determine which environment was passed as command line argument
var currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// check the currentEnvironment is one of the environments above, if not, default to staging
 var environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

 module.exports = environmentToExport;