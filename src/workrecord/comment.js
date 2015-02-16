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

var commentCollection = connection.collection('comments');

function count(){
    commentCollection.count(function(err, result){
        if (err) {
            console.error(clc.red('WorkRecord Comments count error: %s'), err);
        } else {
            console.log('WorkRecord Comments total count %d', result);
        }
    });
}

function findByWorkRecordId(id){
    var deferred = q.defer();

    commentCollection.find({noteID: id}, function(err, result){
        if (err) {
            console.error(clc.red('WorkRecordComments.findByWorkRecordId %s error: %s'), id, err);
            deferred.reject(err);
        } else {
            result.toArray(function(arrayErr, arrayResult){
                if (arrayErr) {
                    console.error(clc.red('WorkRecordComments.findWorkRecords.toArray %s error: %s'), id, arrayErr);
                    deferred.reject(arrayErr);
                } else {
                    deferred.resolve(arrayResult);
                }
            });
        }
    });

    return deferred.promise;
}

function removeManyByWorkRecordId(ids){
    var deferred = q.defer();
    var idStrings = [];
    
    ids.forEach(function(id){
        idStrings.push(id.toString());
    });

    commentCollection.remove({noteID: {$in : idStrings}}, function(err, result){
        if (err) {
            console.error(clc.red('WorkRecordComments.removeManyByWorkRecordId %s error: %s'), idStrings, err);
            deferred.reject(err);
        } else {
            console.log('Removed work record comments %s', result);
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

module.exports = {
    count: count,
    findByWorkRecordId: findByWorkRecordId,
    removeManyByWorkRecordId: removeManyByWorkRecordId
};