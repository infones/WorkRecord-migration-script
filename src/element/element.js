/**
 * Project: eDocu-WorkRecord-Script
 * File: ${FILE_NAME}
 * Author: Matej Polák <polakmatko@gmail.com>
 * Date: 13.2.2015
 * Time: 14:12
 */

var q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;
var clc = require('cli-color');

var connection = require('../mongo/connection');

var elementRepository = {};

function findByIdRecursively(deferred, collectionName, collections, id) {
    connection.collection(collectionName)
        .findOne(
        {_id: new ObjectId(id)},
        {fields: {_type: true, _id: true, organization: true}},
        function(err, result) {
            if (err) {
                console.error(clc.red('Element.findByIdRecursively error: %s'), err);
            } else if (result) {
                elementRepository[id] = result;
                deferred.resolve(result);
            } else {
                var currentColIndex = collections.indexOf(collectionName);
                if (currentColIndex != -1
                    && currentColIndex < (collections.length - 1)
                ) {
                    findByIdRecursively(
                        deferred,
                        collections[(++currentColIndex)],
                        collections,
                        id
                    );
                } else {
                    console.error(clc.red('Element.findByIdRecursively error: Element with id %s was not found in DB'), clc.red.bold(id));
                    deferred.resolve({});
                }
            }
        });
}

function findById(id, collections) {
    var deferred = q.defer();

    if (!elementRepository[id]) {
        findByIdRecursively(deferred, collections[0], collections, id);
    } else {
        deferred.resolve(elementRepository[id]);
    }

    return deferred.promise;
}

function updateManyById(updates) {
    var elementCount = 0;
    var workRecordsCount = 0;
    var updatePromises = [];
    var deferred = q.defer();

    Object.keys(updates).forEach(function (id) {
        var updateDeferred = q.defer();
        var data = updates[id];
        updatePromises.push(updateDeferred.promise);
        connection.collection(data.type)
            .update(
            {_id: data.id},
            {$set: {_workRecords: data.workRecords}},
            function(err, result) {
                if (err) {
                    console.error(clc.red('Element.updateManyById error: %s'), err);
                    updateDeferred.resolve();
                } else {
                    if (result) {
                        //updateDeferred[elementCount].resolve(result);
                        elementCount++;
                        workRecordsCount += data.workRecords.length;
                        
                        updateDeferred.resolve(result);
                        //console.log(elementCount);
                    } else {
                        console.log(
                            'Element.updateManyById result error for element id %s in collection %s: %s',
                            data.id, 
                            data.type, 
                            result
                        );
                        updateDeferred.resolve();
                    }                    
                }
            }
        );
    });
    q.all(updatePromises).spread(
        function() {
            console.log('%d elements were updated with a total count of work records %d', elementCount, workRecordsCount)
            deferred.resolve(elementCount);
        },
        function() {
            console.error('Update element\'s work records promise error');
            deferred.reject();
        }
    ).catch(function(exception){
            console.error(exception);
            deferred.reject();
        }).done();
    return deferred.promise;
}

module.exports = {
    findById: findById,
    updateManyById: updateManyById
};