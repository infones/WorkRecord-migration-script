/**
 * Project: eDocu-WorkRecord-Script
 * File: ${FILE_NAME}
 * Author: Matej Polák <polakmatko@gmail.com>
 * Date: 13.2.2015
 * Time: 11:00
 */

var jsonSchemaValidator = require('jsonschema').validate;
var clc = require('cli-color');

var wrSchema = require('./workrecord-schema.json');

// Estimated edocu production launch 31.7.2013 00:00:00
var edocuStartMillis = (new Date(1375228800000)).getTime();

function isWorkRecordValid(workRecord, id){
    
    function isDateValid(date){
        if ( Object.prototype.toString.call(date) !== "[object Date]" ) {
            return false;
        }
        
        var millis = date.getTime();
        
        return (!isNaN(millis) && millis >= edocuStartMillis);
    }
    
    var isValid = jsonSchemaValidator(workRecord, wrSchema);

    if (!isValid.errors.length) {
        if (isDateValid(workRecord.date)) {
            var i;
            for (i = 0; i < workRecord.comments.length; i++) {
                if (!isDateValid(workRecord.comments[i].date)) {
                    console.error(clc.red('WorkRecord with Id %s has an invalid date in comment: %s'), clc.red.bold(id), workRecord.comments[i].comment);
                    return false;
                }
            }
            return true;
        } else {
            console.error(clc.red('WorkRecord with Id %s has an invalid date'), clc.red.bold(id));
        }
    } else {
        var errorMsg = '';
        isValid.errors.forEach(function(error){
            errorMsg += error.message;
        });
        console.error(clc.red('WorkRecord with Id %s does not match Json schema: %s'), clc.red.bold(id), errorMsg);
    }
    return false;
}

module.exports = isWorkRecordValid;