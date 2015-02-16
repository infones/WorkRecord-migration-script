/**
 * Project: eDocu-WorkRecord-Script
 * File: ${FILE_NAME}
 * Author: Matej Polák <polakmatko@gmail.com>
 * Date: 13.2.2015
 * Time: 13:23
 */

var q = require('q');
var clc = require('cli-color');

var connection = require('../mongo/connection');    

var elementTypeCollection = connection.collection('elements_types');

function find(){
    var deferred = q.defer();

    elementTypeCollection.find({name: {$ne: 'Ticket'}}, {name: 1}, function(err, result){
        if (err) {
            console.error(clc.red('ElementTypes.find error: %s'), err);
            deferred.reject(err);
        } else {
            result.toArray(function(arrayErr, arrayResult){
                if (arrayErr) {
                    console.error(clc.red('ElementTypes.find.toArray error: %s'), arrayErr);
                    deferred.reject(arrayErr);
                } else {
                    var parsedElementTypes = [];
                    arrayResult.forEach(function(type){
                        parsedElementTypes.push(type.name);
                    });
                    deferred.resolve(parsedElementTypes);
                }
            });
        }
    });
    return deferred.promise;
}

module.exports = {
    find: find
};