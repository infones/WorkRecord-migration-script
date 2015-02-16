/**
 * Project: eDocu-WorkRecord-Script
 * File: ${FILE_NAME}
 * Author: Matej Polák <polakmatko@gmail.com>
 * Date: 13.2.2015
 * Time: 13:26
 */

var mongoose = require('mongoose');

var env = process.argv.slice(2)[0];

if (env != 'prod' && env != 'dev') {
    env = 'prod';
}

var config = require('../../config-' + env);

var connection = mongoose.connect(config.db).connection;

console.log('Running in %s environment', env);

module.exports = connection;