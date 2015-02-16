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

var actionCollection = connection.collection('actions');

function find(){
    var deferred = q.defer();

    actionCollection.find({}, {key: true, actionID: true}, function(err, result){
        if (err) {
            console.error(clc.red('WorkRecordActions.find error: %s'), err);
            deferred.reject(err);
        } else {
            result.toArray(function(arrayErr, arrayResult){
                if (arrayErr) {
                    console.error(clc.red('WorkRecordActions.find.toArray error: %s'), arrayErr);
                    deferred.reject(arrayErr);
                } else {
                    var parsedWrActions = {};

                    arrayResult.forEach(function(wrAction){
                        parsedWrActions[wrAction.actionID] = wrAction.key;
                    });

                    deferred.resolve(parsedWrActions);
                }
            });
        }
    });
    return deferred.promise;
}

module.exports = {
    find: find
};