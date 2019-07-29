
// utils
const config = require('../config');
const _ = require('lodash')
const jwt = require('jsonwebtoken');
const path = require('path');
const os = require('os');
const fs = require('fs');
const request = require('request-promise');
const glob = require('glob-gitignore').glob;
const archiver = require('archiver');
const stream = require('stream');
const log = function (...arg) {
  console.log.apply(console, arguments);
}

/**
 * Api utils
 */
var Api = function () {
}

// send get request
Api.prototype.get = async function (url, token, headers = {}) {
  const reqHeaders = getReqHeaders(token, headers);
  const response = await request({
    uri: url,
    method: 'GET',
    headers: reqHeaders
  });
  return JSON.parse(response);
}

// send post request
Api.prototype.post = async function (url, form, token, headers = {}) {
  const reqHeaders = getReqHeaders(token, headers);
  const opts = {
    uri: url,
    method: 'POST',
    headers: reqHeaders
  };
  if (includesFileUpload(form)) {
    opts.formData = form;
  } else {
    opts.form = form;
  }
  const response = await request(opts);
  return JSON.parse(response);
}

// send put request
Api.prototype.put = async function (url, form, token, headers = {}) {
  const reqHeaders = getReqHeaders(token, headers);
  const opts = {
    uri: url,
    method: 'PUT',
    headers: reqHeaders
  };
  if (includesFileUpload(form)) {
    opts.formData = form;
  } else {
    opts.form = form;
  }
  const response = await request(opts);
  return JSON.parse(response);
}

// send delete request
Api.prototype.delete = async function (url, token, headers = {}) {
  const reqHeaders = getReqHeaders(token, headers);
  const response = await request({
    uri: url,
    method: 'DELETE',
    headers: reqHeaders
  });
  return JSON.parse(response);
}

/**
 * sets default headers (auth and content type), and applies additional headers if provided
 *
 * @param {string} token JWT token
 * @param {object} headers Additional headers
 * @return {object} The final headers to be used
 */
const getReqHeaders = function (token, headers) {
  // default headers
  const reqHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  // make all keys lower-case (Content-Type -> content-type)
  // Otherwise there may be two headers for one key (Content-Type and content-type)
  for (const headerKey of _.keys(reqHeaders)) {
    const caseInsensitiveHeaderKey = headerKey.toLowerCase();
    const headerVal = reqHeaders[headerKey];
    delete reqHeaders[headerKey];
    reqHeaders[caseInsensitiveHeaderKey] = headerVal;
  }
  // remove duplicates and use provided header instead of default
  for (const header of _.keys(headers)) {
    reqHeaders[header.toLowerCase()] = headers[header];
  }
  return reqHeaders;
}

/**
 * Checks if given form includes a file upload (i.e. readable stream)
 *
 * @param {object} form Form data
 * @return {boolean}
 */
const includesFileUpload = function (form) {
  for (const key of _.keys(form)) {
    if (form[key] instanceof stream.Readable) {
      return true;
    }
  }
  return false;
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

/**
 * Dismisses the last notification in the time of `timeout`
 *
 * @param {number} timeout (optional) The timeout will be used to dismiss the notification
 * (defaults to 1000 - 1 sec)
 */
const dismissLastNotification = function (timeout = 1000) {
  const lastNotification = _.last(atom.notifications.getNotifications());
  setTimeout(() => { lastNotification.dismiss(); }, timeout);
}

/**
 * Decodes the given token and parses/returns the username/handle
 * @param  {[string]}   token
 * @return  {[string]} handle
 */
const getUserNameFromToken = function (token) {
  const decodedToken = jwt.decode(token);
  return decodedToken.handle;
}

/**
 * Decodes the given token and parses/returns the userId
 * @param  {[string]}   token
 * @return  {[string]} userId
 */
const getUserIdFromToken = function (token) {
  const decodedToken = jwt.decode(token);
  return decodedToken.userId;
}

/**
 * Gets the path to the open workspace

 * Performs below check before proceeding
 * 1. A workspace must be open
 *
 * If it fails, throws an error with an informative message
 * If passes, returns the path
 *
 * @return {string} path to the open workspace
 */
const getWorkspacePath = function () {
  const paths = atom.project.getPaths();
  // A workspace must be open
  if (!paths || !paths[0]) {
    throw new Error(config.WARN_MESSAGES.EMPTY_WORKSPACE_TO_SUBMIT);
  }
  return paths[0];
}

/**
 * Gets .gitignore (if any) rules from the open workspace.
 * `.git` directory is always ignored
 *
 * @param workspacePath path to the open workspace
 * @return {string[]} patterns/rules to be ignored
 */
const getIgnoreRules = async function (workspacePath) {
  const ignoreRules = ['.git'];
  const gitIgnorePath = path.join(workspacePath, '.gitignore');
  const gitIgnoreExists = await fs.existsSync(gitIgnorePath);
  if (gitIgnoreExists) {
    const contents = await fs.readFileSync(gitIgnorePath, 'utf-8');
    const rules = contents.split('\n');
    return [...ignoreRules, ...rules];
  }
  return ignoreRules;
}

/**
 * Gets challengeId from the open workspace. (.topcoderrc file)
 *
 * Performs the below checks before proceeding to the uploading of submission
 * 1. .topcoderrc file must be exist at the root level of open workspace
 * 2. .topcoderrc file must be a JSON file and must include `challengeId`
 * 3. `challengeId` must be a valid number or string
 *
 * If one of above checks fail, throws error with an informative message
 * If all checks pass, then returns the challengeId
 *
 * @return {[string]} challengeId if workspace is valid
 */
const getChallengeId = async function (workspacePath) {
  // .topcoderrc file must be exist at the root level of open workspace
  const topcoderRcPath = path.join(workspacePath, '.topcoderrc');
  if (!fs.existsSync(topcoderRcPath)) {
    throw new Error(config.WARN_MESSAGES.MISSING_TOPCODERRC_FILE);
  }
  // .topcoderrc file must be a JSON file and must include `challengeId`
  // `challengeId` must be a valid number or string
  const topcoderRcContent = await fs.readFileSync(topcoderRcPath, 'utf-8');
  let challengeId = '';
  try {
    challengeId = JSON.parse(topcoderRcContent).challengeId;
    if (typeof challengeId === 'number') {
      // number -> string conversion
      challengeId = challengeId + '';
    }
    challengeId = challengeId.trim && challengeId.trim();
  } catch (err) {
    throw new Error(config.WARN_MESSAGES.INCORRECT_FORMAT_TOPCODERRC);
  }
  if (typeof challengeId !== 'string' || !challengeId) {
    throw new Error(config.WARN_MESSAGES.MISSING_CHALLENGE_ID);
  }
  // workspace is valid
  return challengeId;
}

/**
 * Adds the open workspace to a zip archive.
 * Creates the archive in the temporary directory of the OS,
 * with the `{CHALLENGE_ID}_submission_{TIMESTAMP}.zip` naming format.
 * (i.e. `/tmp` on Linux, `C:\Users\<Username>\AppData\Local\Temp` on Windows)
 *
 * @param {string} workspacePath path to the open workspace
 * @param {string[]} ignoreRules rules/patterns to be excluded
 * @return {string} The path to the created archive
 */
const zipWorkspace = async function (workspacePath, ignoreRules) {
  return new Promise(async (resolve, reject) => {
    const paths = await glob('**/*', {
      cwd: workspacePath,
      dot: true, // hidden files start with dot
      ignore: ignoreRules,
      absolute: true
    });
    const zipPath = path.join(os.tmpdir(), `submission_${Date.now()}.zip`);
    const stream = fs.createWriteStream(zipPath);
    const archive = archiver('zip');
    stream.on('close', () => resolve(zipPath));
    archive.on('warning', (warning) => console.log(`Warning archiving the workspace: ${warning.toString()}`));
    archive.on('error', (err) => {
      console.log(`Error archiving the workspace: ${err.toString()}`);
      reject(err);
    });
    archive.pipe(stream);
    for (const p of paths) {
      archive.file(p, { name: path.relative(workspacePath, p) });
    }
    archive.finalize();
  });
}

var api = new Api();

/**
 * Performs the below checks before proceeding to the uploading of submission
 * 1. Challenge must be exist and must be fetchable with user's token
 * 2. User must be registered to the challenge
 * 3. The submission phase of the challenge must be open
 *
 * If one of above checks fail, rejects the promise with an informative message
 * If all checks pass, then resolves to true
 *
 * @param {[string]} challengeId Challenge Id
 * @param {[string]} token The JWT token to be used in requests
 * @return {[Promise<boolean>]} True if challenge is submittable
 */
const ensureChallengeIsSubmittable = async function (challengeId, token) {
  return new Promise(async (resolve, reject) => {
    try {
      // Challenge must be exist and must be fetchable with user's token
      const url = `${config.TC.CHALLENGE_URL}/${challengeId}`;
      const response = await api.get(url, token);
      const challenge = _.get(response, 'result.content', {});
      // successful response
      // User must be registered to the challenge
      const userName = getUserNameFromToken(token);
      const registrantsHandles = _.map(challenge.registrants, (registrant) => registrant.handle);
      if (!registrantsHandles.includes(userName)) {
        reject(config.WARN_MESSAGES.NOT_REGISTERED_FOR_CHALLENGE);
        return;
      }
      // The submission phase of the challenge must be open
      const submissionPhase = _.filter(challenge.phases, (phase) => phase.type === 'Submission');
      if (!submissionPhase || submissionPhase[0].status !== 'Open') {
        reject(config.WARN_MESSAGES.SUBMISSION_PHASE_NOT_OPEN);
        return;
      }
      // the challenge is submittable
      resolve(true);
    } catch (err) {
      if (err.response && err.response.statusCode === 404) {
          // challenge not found
          reject(config.WARN_MESSAGES.CHALLENGE_NOT_FOUND);
          return;
      } else if (err.response && err.response.statusCode !== 200) {
        // another error
        reject(config.WARN_MESSAGES.COULD_NOT_FETCH_CHALLENGE);
        return;
      }
    }
  });
}

/**
 * Uploads the zip archive as challenge submission
 *
 * @param {string} zipPath path to the zip archive to be uploaded
 * @param {string} challengeId the challenge ID which the submission will be uploaded to
 * @param {string} token The JWT token to be used in request
 * @param {boolean} cleanUpAfterUpload (optional) A flag that indicates if the archive to be deleted after uploading
 * (default true)
 * @return {object} created submission, if successful
 */
const uploadArchive = async function (zipPath, challengeId, token, cleanUpAfterUpload = true) {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = {};
      formData.submission = fs.createReadStream(zipPath);
      formData.type = 'Contest Submission';
      formData.memberId = getUserIdFromToken(token);
      formData.challengeId = challengeId;
      const submission = await api.post(config.TC.SUBMISSION_URL, formData, token);
      resolve(submission);
    } catch (err) {
      reject(err);
    } finally {
      if (cleanUpAfterUpload) {
        fs.unlink(zipPath, () => {});
      }
    }
  });
}

module.exports = {
    log,
    generateHtmlFromChallenges,
    generateHtmlFromChallenge,
    getReqHeaders,
    includesFileUpload,
    dismissLastNotification,
    getUserIdFromToken,
    getUserNameFromToken,
    getIgnoreRules,
    zipWorkspace,
    getWorkspacePath,
    getChallengeId,
    ensureChallengeIsSubmittable,
    uploadArchive,
    api
}
