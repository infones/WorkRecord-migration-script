/**
 * Project: eDocu-WorkRecord-Script
 * File: ${FILE_NAME}
 * Author: Matej Polák <polakmatko@gmail.com>
 * Date: 13.2.2015
 * Time: 14:23
 */

var q = require('q');
var clc = require('cli-color');

var elementTypes = require('../element/type');
var element = require('../element/element');
var workRecords = require('../workrecord/workrecord');
var workRecordActions = require('../workrecord/action');
var workRecordComments = require('../workrecord/comment');
var workRecordFiles = require('../workrecord/file');
var workRecordValidator = require('../validator/validator');

function transform(){
    var parsingDeferred = q.defer();
    var parsingPromise = parsingDeferred.promise;

    q.all([elementTypes.find(), workRecordActions.find(), workRecords.find()])
        .spread(function(elementTypes, workRecordActions, workRecords){
            var parsedWorkRecords = {};
            var invalidWorkRecordIds = [];
            var workRecordCount = 0;
            var workRecordFilesCount = 0;
            var workRecordCommentsCount = 0;

            var parsedWorkRecordPromises = [];

            workRecords.forEach(function(workRecord){

                var parsedWrDeferred = q.defer();

                parsedWorkRecordPromises.push(parsedWrDeferred.promise);

                q.all([
                    element.findById(workRecord.elementID, elementTypes),
                    workRecordComments.findByWorkRecordId(workRecord._id.toString()),
                    workRecordFiles.findByWorkRecordId(workRecord._id.toString())
                ]).spread(function(element, comments, files){
                    workRecordCount++;
                    workRecordFilesCount += files.length;
                    workRecordCommentsCount += comments.length;

                    //console.log('Parsing %d of %d', wrCount, workRecords.length);

                    var parsedWorkRecord = {
                        actionId: workRecordActions[workRecord.actionID],
                        author: workRecord.author,
                        content: workRecord.content,
                        archive: workRecord.reported ? true : false,
                        date: new Date(parseInt(workRecord.timestamp) * 1000),
                        organization: element.organization,
                        comments: comments.map(function(comment){
                            return {
                                author: comment.author,
                                comment: comment.comment,
                                date: new Date(parseInt(comment.timestamp) * 1000),
                                organization: element.organization
                            };
                        }),
                        files: files.map(function(file){
                            return {
                                originalName: file.filename,
                                hash: file.hash
                            };
                        })
                    };

                    if (workRecordValidator(parsedWorkRecord, workRecord._id)) {
                        var elementIdString = element._id.toString();
                        if (!parsedWorkRecords[elementIdString]) {
                            parsedWorkRecords[elementIdString] = {
                                id: element._id,
                                type: element._type,
                                workRecords: []
                            };
                        }

                        parsedWorkRecords[element._id].workRecords.push(parsedWorkRecord);
                    } else {
                        invalidWorkRecordIds.push(workRecord._id);
                    }

                    parsedWrDeferred.resolve(parsedWorkRecord);

                }, function(){
                    console.log('Error occurred while parsing workrecords %s', JSON.stringify(arguments));
                }).done();
            });

            q.all(parsedWorkRecordPromises).spread(function(){
                console.log('Number of parsed WorkRecord: %d', workRecordCount);
                console.log('Number of WorkRecord Files used in parsing: %d', workRecordFilesCount);
                console.log('Number of WorkRecord Comments used in parsing: %d', workRecordCommentsCount);
                console.error(clc.red('Number of invalid WorkRecords: %d'), invalidWorkRecordIds.length);
                parsingDeferred.resolve([parsedWorkRecords, invalidWorkRecordIds]);
            }, function(){
                console.error(clc.red('Error waiting for parsed promises'));
            }).done();
        });

    return parsingPromise;
}

module.exports = transform;