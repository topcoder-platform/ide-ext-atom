'use babel';

const _ = require('lodash');
const config = require('../config');
const testConfig = require('../config/test');
const fs = require('fs');
const path = require('path');

describe('TopcoderWorkflow E2E tests', () => {
    let workspaceElement;

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace);
        atom.packages.activatePackage('topcoder-workflow');
        atom.config.set(`${config.EXT_NAME}.username`, testConfig.USERNAME);
        atom.config.set(`${config.EXT_NAME}.password`, testConfig.PASSWORD);
    });

    // test login menu(ctrl-shift-t) without username
    it('begin to login without username', () => {
        atom.config.set(`${config.EXT_NAME}.username`, '');
        atom.commands.dispatch(workspaceElement, 'topcoder:login');

        waitsFor(() => {
            if (atom.notifications.getNotifications().length > 0) {
                return _.last(atom.notifications.getNotifications()).getMessage() === config.WARN_MESSAGES.MISSING_USERNAME;
            }
        }, 'Timeout issue in testing login', testConfig.TIMEOUT);

        runs(() => {
            const t = localStorage.getItem("atom_topcoder_token");
            expect(t).toBe(null);
        });
    });

    // test login menu(ctrl-shift-t) without username
    it('begin to login without password', () => {
        atom.config.set(`${config.EXT_NAME}.password`, '');
        atom.commands.dispatch(workspaceElement, 'topcoder:login');

        waitsFor(() => {
            if (atom.notifications.getNotifications().length > 0) {
                return _.last(atom.notifications.getNotifications()).getMessage() === config.WARN_MESSAGES.MISSING_PASSWORD;
            }
        }, 'Timeout issue in testing login', testConfig.TIMEOUT);

        runs(() => {
            const t = localStorage.getItem("atom_topcoder_token");
            expect(t).toBe(null);
        });
    });

    // test login menu(ctrl-shift-t)
    it('begin to login', () => {
        atom.commands.dispatch(workspaceElement, 'topcoder:login');

        waitsFor(() => {
            if (atom.notifications.getNotifications().length > 0) {
                return _.last(atom.notifications.getNotifications()).getMessage() === config.INFO_MESSAGES.LOGGED_IN;
            }
        }, 'Timeout issue in testing login', testConfig.TIMEOUT);

        runs(() => {
            const t = localStorage.getItem("atom_topcoder_token");
            expect(t).not.toBe(null);
        });
    });

    // test view open challenges menu(ctrl-shift-h)
    it('begin to view open challenges', () => {
        atom.commands.dispatch(workspaceElement, 'topcoder:viewOpenChallenges');

        waitsFor(() => {
            if (atom.workspace.getActiveTextEditor()) {
                if (atom.workspace.getActiveTextEditor().getTitle() === 'openChallenges.md') {
                    return true;
                }
            }
        }, 'Timeout issue in testing view open challenges', testConfig.TIMEOUT);

        runs(() => {
            const filePath = path.join(__dirname, '../temp/openChallenges.md');
            const data = fs.readFileSync(filePath);
            const text = data.toString().split('\n');
            expect(text.length > 2).toBe(true);
        });
    });

    // test logout menu(ctrl-shift-i)
    it('begin to logout', () => {
        atom.commands.dispatch(workspaceElement, 'topcoder:logout');

        waitsFor(() => {
            if (atom.notifications.getNotifications().length > 0) {
                return _.last(atom.notifications.getNotifications()).getMessage() === config.INFO_MESSAGES.LOGGED_OUT;
            }
        }, 'Timeout issue in testing logout', testConfig.TIMEOUT);

        runs(() => {
            const t = localStorage.getItem("atom_topcoder_token");
            expect(t).toBe(null);
        });
    });

    // test view open challenges menu(ctrl-shift-h), it will automatically login first
    it('begin to view open challenges without login', () => {
        const t = localStorage.getItem("atom_topcoder_token");
        expect(t).toBe(null);

        atom.commands.dispatch(workspaceElement, 'topcoder:viewOpenChallenges');

        waitsFor(() => {
            if (atom.workspace.getActiveTextEditor()) {
                if (atom.workspace.getActiveTextEditor().getTitle() === 'openChallenges.md') {
                    return true;
                }
            }
        }, 'Timeout issue in testing view open challenges without login', testConfig.TIMEOUT);

        runs(() => {
            const filePath = path.join(__dirname, '../temp/openChallenges.md');
            const data = fs.readFileSync(filePath);
            const text = data.toString().split('\n');
            expect(text.length > 2).toBe(true);
            const t = localStorage.getItem("atom_topcoder_token");
            expect(t).not.toBe(null);
        });
    });
});
