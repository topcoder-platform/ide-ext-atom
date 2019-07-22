'use babel';

const config = require('../config');
const logger = config.logger;
const TCAuth = require('./auth/TCAuth');

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const {
    log,
    generateHtmlFromChallenges,
    generateHtmlFromChallenge,
    api
} = require('./utils.js');
import TopcoderWebView from './topcoder-web-view'

import { CompositeDisposable } from 'atom';

/**
 * Control class of topcoder-workflow package
 *
 */
export default {
    subscriptions: null,
    openChallengesView: null,
    challenges: [],
    challenge: null,
    uriPattern: 'atom://topcoder-workflow/challenges',

    activate (state) {

        this.clearCache();

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that inserts this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'topcoder:login': () => this.login(),
            'topcoder:logout': () => this.logout(),
            'topcoder:viewOpenChallenges': () => this.viewOpenChallenges()
        }));

        this.subscriptions.add(atom.workspace.addOpener((uri) => {
            if (uri.startsWith(this.uriPattern)) {
                if (uri.length === this.uriPattern.length) {
                    if (this.openChallengesView) {
                        this.openChallengesView.reload(generateHtmlFromChallenges(this.challenges));
                        return this.openChallengesView;
                    } else {
                        this.openChallengesView = new TopcoderWebView({ html: generateHtmlFromChallenges(this.challenges) });
                        return this.openChallengesView;
                    }
                } else {
                    if (this.challenge) {
                        const param = { html: generateHtmlFromChallenge(this.challenge), title: this.challenge.challengeTitle }
                        this.challenge = null;
                        return new TopcoderWebView(param);
                    } else {
                        let challengeId = uri.substring(this.uriPattern.length + 1)
                        this.viewChallenge(challengeId)
                    }
                }
            }
        }));

        // create token refresh timeer
        this.refreshTimer = setInterval(() => {
           this.refreshToken();
        }, config.TC.TOKEN_REFRESH_TIME);
    },

    deactivate () {
        this.subscriptions.dispose();
        clearInterval(this.refreshTimer);
    },

    /**
     * [refreshToken send request to config.TC.TOKEN_REFRESH_URL to refresh the token]
     */
    refreshToken () {
        const token = this.getToken()
        if (token === null) {
            return ;
        }
        api.get(config.TC.TOKEN_REFRESH_URL, token, (res) => {
            const response = JSON.parse(res.response);
            const newToken = response.result.content.token;
            log('getting refresh token', newToken);
            if (newToken) {
                this.saveToken(newToken);
            }
        });
    },

    /**
     * [login function]
     * @param  {[string]} lastAction [What user is doing before login(method name)]
     * @param  {[array]}  parameters [lastAction method parameters]
     */
    login (lastAction, parameters) {
        const username = atom.config.get(`${config.EXT_NAME}.username`);
        const password = atom.config.get(`${config.EXT_NAME}.password`);

        if (username.trim().length === 0) {
            atom.notifications.addWarning(config.WARN_MESSAGES.MISSING_USERNAME);
            return;
        }
        if (password.trim().length === 0) {
            atom.notifications.addWarning(config.WARN_MESSAGES.MISSING_PASSWORD);
            return;
        }

        atom.notifications.addInfo(config.INFO_MESSAGES.LOGGING_IN, { dismissable: true });

        let tca = new TCAuth(config.TC, logger);
        tca.login(username, password, (err, accessToken) => {
            if (err) {
                atom.notifications.addError(`Login failed, ${err}, please check your username/password in configuration`, { dismissable: true });
            } else {
                _.last(atom.notifications.getNotifications()).dismiss();
                this.saveToken(accessToken);

                // when login success,
                // if user comes to login from loading challenges/challenge detail,
                // jump back to load challenges/challenge detail
                if (lastAction) {
                    atom.notifications.addSuccess(config.INFO_MESSAGES.LOGGED_IN, { dismissable: true });
                    const loginSuccessNotification = _.last(atom.notifications.getNotifications());
                    setTimeout(() => { loginSuccessNotification.dismiss(); }, 1000);

                    if (lastAction === 'viewOpenChallenges') {
                        return this.viewOpenChallenges();
                    } else {
                        return this.viewChallenge(...parameters);
                    }
                } else {
                    atom.notifications.addSuccess(config.INFO_MESSAGES.LOGGED_IN);
                }

            }
        });
    },

    /**
     * [logout function]
     */
    logout () {
        this.clearCache();
        atom.notifications.addSuccess(config.INFO_MESSAGES.LOGGED_OUT);
    },

    /**
     * [viewOpenChallenges render open challenges]
     */
    viewOpenChallenges () {
        const token = this.getToken();
        // if not logged in, send login request
        if (token === null) {
            this.login('viewOpenChallenges');
            return;
        }

        atom.notifications.addInfo(config.INFO_MESSAGES.LOADING_OPEN_CHALLENGES, { dismissable: true });

        api.get(config.TC.CHALLENGES_URL, token, (res) => {
            _.last(atom.notifications.getNotifications()).dismiss();
            if (res.status !== 200) {
                atom.notifications.addError(`Fetch open challenges failed, ${res.response}`, { dismissable: true });
                return;
            }

            const response = JSON.parse(res.response);
            this.challenges = response.result.content;

            return atom.workspace.open(this.uriPattern, { searchAllPanes: true });
        });
    },

    /**
     * [viewChallenge render challenge detail]
     * @param  {[string]} challengeId [the challenge id]
     */
    viewChallenge (challengeId) {
        const token = this.getToken();
        // if not logged in, send login request
        if (token === null) {
            this.login('viewChallenge', [challengeId]);
            return;
        }

        atom.notifications.addInfo(config.INFO_MESSAGES.LOADING_CHALLENGE, { dismissable: true });

        api.get(`${config.TC.CHALLENGE_URL}/${challengeId}`, token, (res) => {
            _.last(atom.notifications.getNotifications()).dismiss();
            if (res.status !== 200) {
                atom.notifications.addError(`Fetch challenge detail failed, ${res.response}`, { dismissable: true });
                return;
            }

            const response = JSON.parse(res.response);
            this.challenge = response.result.content;

            return atom.workspace.open(`${this.uriPattern}/${challengeId}`);
        });
    },

    /**
     * [saveToken store the token]
     * @param  {[string]} token [latest token]
     */
    saveToken (token) {
        localStorage.setItem('atom_topcoder_token', token);
    },

    /**
     * [getToken get the stored token]
     * @return {[string]} [token]
     */
    getToken () {
        const t = localStorage.getItem('atom_topcoder_token');
        return t;
    },

    /**
     * [clearCache delete stored token]
     */
    clearCache () {
        localStorage.removeItem('atom_topcoder_token');
    }
};
