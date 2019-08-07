'use strict'

const winston = require('winston')

let config = {}

config.useDevEndpoints = true

config.TC = {}
config.TC.AUTHN_URL = config.useDevEndpoints
  ? 'https://topcoder-dev.auth0.com/oauth/ro'
  : 'https://topcoder.auth0.com/oauth/ro'
config.TC.AUTHZ_URL = config.useDevEndpoints
  ? 'https://api.topcoder-dev.com/v3/authorizations'
  : 'https://api.topcoder.com/v3/authorizations'
config.TC.CHALLENGES_URL = config.useDevEndpoints
  ? 'https://api.topcoder-dev.com/v4/challenges/?filter=status%3DACTIVE'
  : 'https://api.topcoder.com/v4/challenges/?filter=status%3DACTIVE'
config.TC.CHALLENGE_URL = config.useDevEndpoints
  ? 'https://api.topcoder-dev.com/v4/challenges'
  : 'https://api.topcoder.com/v4/challenges'
config.TC.SUBMISSION_URL = config.useDevEndpoints
  ? 'https://api.topcoder-dev.com/v5/submissions'
  : 'https://api.topcoder.com/v5/submissions'
config.TC.TOKEN_REFRESH_URL = config.useDevEndpoints
  ? 'https://api.topcoder-dev.com/v3/authorizations/1'
  : 'https://api.topcoder.com/v3/authorizations/1'
config.TC.TOKEN_REFRESH_TIME = 10 * 60 * 1000
config.TC.CLIENT_ID = config.useDevEndpoints
  ? 'JFDo7HMkf0q2CkVFHojy3zHWafziprhT'
  : '6ZwZEUo2ZK4c50aLPpgupeg5v2Ffxp9P'
config.TC.CLIENT_V2CONNECTION = config.useDevEndpoints ? 'TC-User-Database' : 'LDAP'

config.LOG_LEVEL = 'info'
config.LOG_FILE = 'app.log'

config.EXT_NAME = 'topcoder-workflow'
config.WARN_MESSAGES = {
  MISSING_USERNAME: 'Missing username. Configure your username in package settings.',
  MISSING_PASSWORD: 'Missing password. Configure your password in package settings.',
  EMPTY_WORKSPACE_TO_SUBMIT: 'Empty workspace to submit. You should open a workspace first.',
  MISSING_TOPCODERRC_FILE: 'No .topcoderrc file detected in the current workspace.',
  INCORRECT_FORMAT_TOPCODERRC: 'Incorrect format of .topcoderrc, it should be in JSON format.',
  MISSING_CHALLENGE_ID: 'Missing challengeId in .topcoderrc.',
  NOT_REGISTERED_FOR_CHALLENGE: 'You are not registered to this challenge.',
  CHALLENGE_NOT_FOUND: 'Could not find the specified challenge',
  COULD_NOT_FETCH_CHALLENGE: 'Could not fetch the specified challenge',
  SUBMISSION_PHASE_NOT_OPEN: 'The submission phase is not open for this challenge',
  INCORRECT_CHALLENGE_ID: 'challenge id should be a positive integer'
}
config.INFO_MESSAGES = {
  LOGGING_IN: 'Logging in user.',
  LOGGED_IN: 'You are logged in.',
  LOGGED_OUT: 'Logged out.',
  LOADING_OPEN_CHALLENGES: 'Loading open challenges.',
  LOADING_CHALLENGE: 'Loading challenge detail.',
  START_UPLOAD_SUBMISSION: 'Start uploading your submission',
  ARCHIVING_WORKSPACE: 'Archiving your workspace. Please wait...',
  UPLOADING_SUBMISSION: 'Uploading your submission to Topcoder. Please wait...',
  UPLOADED_SUBMISSION: 'Your submission has been successfully uploaded to the challenge.',
  REGISTERING_MESSAGE: 'Registering for challenge',
  REGISTERED_SUCCESS: 'Registered Successfully'
}

config.logger = new (winston.Logger)({
  level: config.LOG_LEVEL,
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename: config.LOG_FILE
    })
  ]
})

module.exports = config
