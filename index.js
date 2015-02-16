/**
 * Project: eDocu-WorkRecord-Script
 * File: ${FILE_NAME}
 * Author: Matej Polák <polakmatko@gmail.com>
 * Date: 13.2.2015
 * Time: 14:46
 */

var q = require('q');
var clc = require('cli-color');

var transform = require('./src/transform/transform');
var connection = require('./src/mongo/connection');
var element = require('./src/element/element');
var workRecords = require('./src/workrecord/workrecord');
var workFiles = require('./src/workrecord/file');
var workComments = require('./src/workrecord/comment');

workRecords.count();
workComments.count();
workFiles.count();

function done() {
    console.log('Done!!!');
    connection.close();
    process.exit(0);
}

transform().then(function(newWrsAndInvalidWrIds) {
    var newWorkRecords = newWrsAndInvalidWrIds[0];
    var invalidWorkRecords = newWrsAndInvalidWrIds[1];

    var promises = [element.updateManyById(newWorkRecords)];
    if (invalidWorkRecords.length) {
        promises.push(workRecords.removeManyById(invalidWorkRecords));
        promises.push(workFiles.removeManyByWorkRecordId(invalidWorkRecords));
        promises.push(workComments.removeManyByWorkRecordId(invalidWorkRecords));
    }
    q.all(promises)
        .spread(function() {
            console.log(clc.green.bold('Success'));
            done();
        }, function() {
            console.error(clc.red.bold('Error'));
            done();
        }).done();
});
