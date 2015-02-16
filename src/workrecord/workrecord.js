/**
 * Project: eDocu-WorkRecord-Script
 * File: ${FILE_NAME}
 * Author: Matej Polák <polakmatko@gmail.com>
 * Date: 13.2.2015
 * Time: 13:22
 */

var q = require('q');
var clc = require('cli-color');

var connection = require('../mongo/connection');

var workRecordCollection = connection.collection('notes');

function count(){
    workRecordCollection.count(function(err, result){
        if (err) {
            console.error(clc.red('WorkRecord count error: %s'), err);
        } else {
            console.log('WorkRecord total count %d', result);
        }
    });
}

function find(){
    var deferred = q.defer();

    workRecordCollection.find({}, function(err, result){
        if (err) {
            console.error(clc.red('WorkRecords.find error: %s'), err);
            deferred.reject(err);
        } else {
            result.toArray(function(arrayErr, arrayResult){
                if (arrayErr) {
                    console.error(clc.red('WorkRecords.find.toArray error: %s'), arrayErr);
                    deferred.reject(arrayErr);
                } else {
                    deferred.resolve(arrayResult);
                }
            });
        }
    });
    return deferred.promise;
}

function removeManyById(ids){
    var deferred = q.defer();

    workRecordCollection.remove({_id: {$in: ids}}, function(err, result){
        if (err) {
            console.error(clc.red('WorkRecord.removeId %s error: %s'), ids, err);
            deferred.reject(err);
        } else {
            console.log('Removed work records %s', result);
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

module.exports = {
    count: count,
    find: find,
    removeManyById: removeManyById
};