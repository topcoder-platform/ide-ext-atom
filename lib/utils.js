
// utils

const _ = require('lodash')

const log = function (...arg) {
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
 * Generate html page content from challenges
 * @param {Array} challenges the challeges
 * @return {String} the html page content
 */
const generateHtmlFromChallenges = function (challenges) {
    return `<table border="1" style="margin-top: 10px; margin-bottom: 30px;">
              <tr>
                <th>Challenge Name</th>
                <th>Challenge Type</th>
                <th>Number of registrants</th>
                <th>Prizes</th>
                <th>Current Phase</th>
              </tr>
              ${generateHtmlTableFromChallenges(challenges).join('')}
            </table>`;
}

/**
 * Generate html table content from challenges
 * @param {Array} challenges the challeges
 * @return {String} the html table content
 */
const generateHtmlTableFromChallenges = function (challenges) {
    return challenges
        .map((challenge) => {
            const filteredPhases = _.filter(challenge.currentPhases, (item) => item.phaseStatus === 'Open');
            return `<tr>
                      <td><a href="atom://topcoder-workflow/challenges/${challenge.id}">${challenge.name}</a></td>
                      <td>${challenge.subTrack}</td>
                      <td>${challenge.numRegistrants}</td>
                      <td>${_.join(_.map(challenge.prizes, (x) => `\$${x}`), ', ')}</td>
                      <td>${_.join(_.map(filteredPhases, 'phaseType'), ', ')}</td>
                    </tr>`;
        });
}

/**
 * Add ordinal to a given number
 * @param {Number} num the integer number
 * @return {String} the number having ordinal suffix
 */
const ordinalNumber = function (num) {
    let mod10 = num % 10;
    let mod100 = num % 100;
    if (mod10 === 1 && mod100 !== 11) {
        return num + "st";
    }
    if (mod10 === 2 && mod100 !== 12) {
        return num + "nd";
    }
    if (mod10 === 3 && mod100 !== 13) {
        return num + "rd";
    }
    return num + "th";
}

/**
 * Generate html table content for challenge prizes
 * @param {Array} prizes the challenge prizes
 * @return {String} the html table content having challenge prizes
 */
const generateHtmlTableFromPrizes = function (prizes) {
    if (prizes && prizes.length > 0) {
        return `<table border="1" style="margin-top: 10px; margin-bottom: 10px;">
                  <tr>
                    ${_.join(_.map(prizes, (p, i) => `<th>${ordinalNumber(i + 1)} Place</th>`), '')}
                  </tr>
                  <tr>
                    ${_.join(_.map(prizes, p => `<td>$${p}</td>`), '')}
                  </tr>
                </table>`
    } else {
        return '';
    }
}

/**
 * Generate html table content for challenge meta data
 * @param {Object} challenge the challenge
 * @return {String} the html table content having challenge meta data
 */
const generateHtmlTableFromMetas = function (challenge) {
    return `<table border="1" style="margin-top: 10px; margin-bottom: 10px;">
              <tr>
                <th>Current Phase</th>
                <th># of Registrants</th>
                <th># of Submissions</th>
              </tr>
              <tr>
                <td>${_.get(challenge, 'currentPhaseName', '')}</td>
                <td>${_.get(challenge, 'numberOfRegistrants', '')}</td>
                <td>${_.get(challenge, 'numberOfSubmissions', '')}</td>
              </tr>
            </table>`
}

/**
 * Generate html content from challenge
 * @param {Object} challenge the challenge
 * @return {String} the html challenge detail content
 */
const generateHtmlFromChallenge = function (challenge) {
    return `<h1>${challenge.challengeTitle}</h1>
            <h2>Prizes</h2>
            ${generateHtmlTableFromPrizes(challenge.prizes)}
            <h2>Meta</h2>
            ${generateHtmlTableFromMetas(challenge)}
            <h2>Specification</h2>`
                .concat(_.get(challenge, 'introduction', '')) // for Design challenge
                .concat(_.get(challenge, 'detailedRequirements', ''))
                .concat(`<h2>Submission Guidelines</h2>`)
                .concat(_.get(challenge, 'finalSubmissionGuidelines', ''));
}

var api = new Api();

module.exports = {
    log,
    generateHtmlFromChallenges,
    generateHtmlFromChallenge,
    api
}
