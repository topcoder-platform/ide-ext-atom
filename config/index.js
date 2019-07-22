'use strict';

const winston = require('winston');

let config = {};

config.TC = {};
config.TC.AUTHN_URL = 'https://topcoder.auth0.com/oauth/ro';
config.TC.AUTHZ_URL = 'https://api.topcoder.com/v3/authorizations';
config.TC.CHALLENGES_URL = 'https://api.topcoder.com/v4/challenges/?filter=status%3DACTIVE';
config.TC.CHALLENGE_URL = 'https://api.topcoder.com/v4/challenges';
config.TC.TOKEN_REFRESH_URL = 'https://api.topcoder.com/v3/authorizations/1';
config.TC.TOKEN_REFRESH_TIME = 10 * 60 * 1000;
config.TC.CLIENT_ID = '6ZwZEUo2ZK4c50aLPpgupeg5v2Ffxp9P';
config.TC.CLIENT_V2CONNECTION = 'LDAP';

config.LOG_LEVEL = 'info';
config.LOG_FILE = 'app.log';

config.EXT_NAME = 'topcoder-workflow';
config.WARN_MESSAGES = {
  MISSING_USERNAME: 'Missing username. Configure your username in package settings.',
  MISSING_PASSWORD: 'Missing password. Configure your password in package settings.'
};
config.INFO_MESSAGES = {
  LOGGING_IN: 'Logging in user.',
  LOGGED_IN: 'You are logged in.',
  LOGGED_OUT: 'Logged out.',
  LOADING_OPEN_CHALLENGES: 'Loading open challenges.',
  LOADING_CHALLENGE: 'Loading challenge detail.'
};

config.logger = new(winston.Logger)({
    level: config.LOG_LEVEL,
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
            filename: config.LOG_FILE
        })
    ]
});

module.exports = config;
