'use babel';

const config = require('../config');
const logger = config.logger;
const TCAuth = require('./auth/TCAuth');

const fs = require('fs');
const {
    bindEvent,
    log,
    isCredentialsValid,
    api,
} = require('./utils.js');


import TopcoderWorkflowView from './topcoder-workflow-view';
import { CompositeDisposable } from 'atom';

/**
 * Control class of topcoder-workflow package
 *
 */
export default {

    topcoderWorkflowView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {

        this.topcoderWorkflowView = new TopcoderWorkflowView(state.topcoderWorkflowViewState);
        this.modalPanel = atom.workspace.addModalPanel({
          item: this.topcoderWorkflowView.getElement(),
          visible: false
        });

        this.clearCache();

        // bind events from view
        this.bindViewEvents();

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that inserts this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'topcoder:toggle': () => this.toggle(),
            'topcoder:login': () => this.login(),
            'topcoder:load': () => this.loadChallenges(),
        }));

        // create token refresh timeer
        this.refreshTimer = setInterval(() => {
           this.refreshToken()
        }, config.TC.TOKEN_REFRESH_TIME);
    },

    deactivate() {
        this.subscriptions.dispose();
        clearInterval(this.refreshTimer);
    },

    /**
     * [refreshToken send request to config.TC.TOKEN_REFRESH_URL to refresh the token]
     */
    refreshToken() {
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
     * [bindViewEvents bind events from user actions on html element]
     */
    bindViewEvents() {
        const element = this.topcoderWorkflowView.getElement()
        bindEvent(element, 'click', (event) => {
            const t = event.target;

            if (t.classList.contains('tp-hide-button')) {
                this.toggle();
            }

            if (t.classList.contains('tp-login-button')) {
                this.login();
            }

            if (t.classList.contains('tp-challenge-load-button')) {
                this.loadChallenges();
            }
        });
    },

    /**
     * [login login function]
     * @param  {[string]} lastAction [What user is doing before login]
     */
    login(lastAction) {

        this.show();

        // if user hasn't set valid credentials, do nothing.
        if (!isCredentialsValid()) {
            return;
        }

        this.topcoderWorkflowView.insertLoading();
        this.topcoderWorkflowView.setLoginText('Waiting...');

        let tca = new TCAuth(config.TC, logger);
        tca.login(config.TC.USERNAME, config.TC.PASSWORD, (err, accessToken) => {
            this.topcoderWorkflowView.removeLoading();
            if (err) {
                this.topcoderWorkflowView.setLoginText(`Login failed, ${err}, please check your username/password in configuration`);
            } else {
                const loginInfo = `
                    Logged in as: <span class="handle">${config.TC.USERNAME}</span>
                `;
                this.topcoderWorkflowView.setLoginText(loginInfo);
                this.saveToken(accessToken);

                // when login success,
                // if user comes to login from loading challenges,
                // jump back to laod challenges
                if (lastAction === 'load') {
                    this.loadChallenges();
                }

            }
        });
    },

    /**
     * [saveToken store the token]
     * @param  {[string]} token [latest token]
     */
    saveToken(token) {
        localStorage.setItem("atom_topcoder_token", token);
    },

    /**
     * [getToken get the stored token]
     * @return {[string]} [token]
     */
    getToken() {
        const t = localStorage.getItem("atom_topcoder_token");
        return t;
    },

    /**
     * [clearCache delete stored token]
     */
    clearCache() {
        localStorage.removeItem("atom_topcoder_token");
    },

    /**
     * [loadChallenges load challenges from api]
     */
    loadChallenges() {

        this.show();

        const token = this.getToken();
        // if not logged in, send login request
        if (token === null) {
            this.login('load')
            return ;
        }

        this.topcoderWorkflowView.insertLoading()

        api.get(config.TC.CHALLENGES_URL, token, (res) => {
            this.topcoderWorkflowView.removeLoading()

            const response = JSON.parse(res.response);
            const content = response.result.content;
            this.topcoderWorkflowView.displayChallenges(content);
        });
    },

    /**
     * [toggle, toggle main panel show/hide]
     */
    toggle() {
        return (
            this.modalPanel.isVisible() ?
            this.modalPanel.hide() :
            this.modalPanel.show()
        );
    },

    /**
     * [show, show the main panel]
     */
    show() {
        if (!this.modalPanel.isVisible()) {
            this.modalPanel.show();
        }
    }

};
