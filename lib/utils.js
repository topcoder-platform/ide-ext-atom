
// utils

const _ = require('lodash')
const config = require('../config');

const log = function(...arg) {
  console.log.apply(console, arguments);
}

/**
 * Api utils
 */
var Api = function () {
}

// send ajax request
Api.prototype.sendRequest = function (method, url, form, token, callback) {
    var r = new XMLHttpRequest()
    r.open(method, url, true)
    r.setRequestHeader('Content-Type', 'application/json')
    // add token to header
    if (token) {
        r.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    r.onreadystatechange = () => {
        if(r.readyState === 4) {
            callback(r)
        }
    }

    var data = JSON.stringify(form)
    r.send(data)
}

//sed get request
Api.prototype.get = function (url, token, callback) {
    this.sendRequest('GET', url, {}, token, callback);
}

// send post request
Api.prototype.post = function (url, form, token, callback) {
    this.sendRequest('POST', url, form, token, callback);
}

// send put request
Api.prototype.post = function (url, form, token, callback) {
    this.sendRequest('PUT', url, form, token, callback);
}

// send delete request
Api.prototype.post = function (url, token, callback) {
    this.sendRequest('DELETE', url, {}, token, callback);
}

/**
 * Escape the `|` character in markdown.
 * @param {String} str the string to be modified
 * @return {String} The escaped string.
 */
const escapePipeChar = function (str) {
    return _.replace(str, '|', '\\|');
}

/**
 * print challenges in MarkDown format
 * @params {Array} challenges the challenge items
 * @return {String} the MarkDown format content
 */
const printChallengesInMD = function (challenges) {
    let tableMd = '|Challenge Name|Challenge Type|Number of registrants|Prizes|Current Phase|\n';
    tableMd += '|--------|--------|--------|--------|--------|\n';

    _.each(challenges, (challenge) => {
        const filteredPhases = _.filter(challenge.currentPhases, (item) => item.phaseStatus === 'Open');

        const challengeName = escapePipeChar(challenge.name);
        const challengeType = escapePipeChar(challenge.subTrack);
        const numRegistrants = escapePipeChar(challenge.numRegistrants);
        const prizes = escapePipeChar(_.join(_.map(challenge.prizes, (x) => `\$${x}`), ', '));
        const currentPhases = escapePipeChar(_.join(_.map(filteredPhases, 'phaseType'), ', '));

        const row = `|${challengeName}|${challengeType}|${numRegistrants}|${prizes}|${currentPhases}|\n`;

        tableMd += row;
    });

    return tableMd;
}

var api = new Api();

module.exports = {
    log,
    printChallengesInMD,
    api,
}
