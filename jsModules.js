"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTime = exports.log = void 0;
//Creates the string to log requests in the console
function log(log) {
    var timeStamp = getTime();
    console.log(timeStamp.concat(log));
}
exports.log = log;
//Fetches the current time
function getTime() {
    var today = new Date();
    return "[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + "]: ";
}
exports.getTime = getTime;
