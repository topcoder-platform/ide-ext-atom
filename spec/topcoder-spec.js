'use babel';

const _ = require('lodash');
const config = require('../config');
const testConfig = require('../config/test');

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
            if (atom.workspace.getActivePaneItem()) {
                if (atom.workspace.getActivePaneItem().getTitle() === 'Topcoder: Open challenges') {
                    return true;
                }
            }
        }, 'Timeout issue in testing view open challenges', testConfig.TIMEOUT);

        runs(() => {
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML.startsWith(`<table border="1" style="margin-top: 10px; margin-bottom: 30px;">`)).toBe(true);
            expect(atom.workspace.getActivePaneItem().getElement().children[0].rows.length).toBeGreaterThan(0);
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

    let activePane

    // test view open challenges menu(ctrl-shift-h), it will automatically login first
    it('begin to view open challenges without login', () => {
        const t = localStorage.getItem("atom_topcoder_token");
        expect(t).toBe(null);

        atom.commands.dispatch(workspaceElement, 'topcoder:viewOpenChallenges');

        waitsFor(() => {
            if (atom.workspace.getActivePaneItem()) {
                if (atom.workspace.getActivePaneItem().getTitle() === 'Topcoder: Open challenges') {
                    return true;
                }
            }
        }, 'Timeout issue in testing view open challenges without login', testConfig.TIMEOUT);

        runs(() => {
            activePane = atom.workspace.getActivePaneItem().getElement();
            expect(activePane.innerHTML.startsWith(`<table border="1" style="margin-top: 10px; margin-bottom: 30px;">`)).toBe(true);
            expect(activePane.children[0].rows.length).toBeGreaterThan(0);
        });
    });

    // test view challenge detail
    it('begin to view challenge detail', () => {
        let rows = activePane.children[0].rows;
        let index;
        for (index = 0; index < rows.length; index++) {
            if (rows[index].cells.item(1).textContent === 'CODE') {
                break;
            }
        }
        rows[index].getElementsByTagName('a')[0].click();
        waitsFor(() => {
            if (atom.workspace.getActivePaneItem()) {
                if (atom.workspace.getActivePaneItem().getTitle() === rows[index].cells.item(0).textContent) {
                    return true;
                }
            }
        }, 'Timeout issue in testing view challenge detail', testConfig.TIMEOUT);

        runs(() => {
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h1>');
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h2>Prizes</h2>');
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h2>Meta</h2>');
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h2>Specification</h2>');
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h2>Submission Guidelines</h2>');
        });
    });

    // test view challenge detail without login(logout first)
    it('begin to view challenge detail without login', () => {
        let beforeLength = atom.notifications.getNotifications().length;

        // logout
        atom.commands.dispatch(workspaceElement, 'topcoder:logout');

        let rows = activePane.children[0].rows;
        let index;
        for (index = rows.length - 1; index >= 0; index--) {
            if (rows[index].cells.item(1).textContent === 'CODE') {
                break;
            }
        }

        // it will first login before fetch challenge detail
        rows[index].getElementsByTagName('a')[0].click();
        waitsFor(() => {
            if (atom.workspace.getActivePaneItem()) {
                if (atom.workspace.getActivePaneItem().getTitle() === rows[index].cells.item(0).textContent) {
                    return true;
                }
            }
        }, 'Timeout issue in testing view challenge detail', testConfig.TIMEOUT);

        runs(() => {
            notifications = atom.notifications.getNotifications();
            expect(notifications.length).toEqual(beforeLength + 4);
            expect(notifications[notifications.length - 4].getMessage()).toEqual('Logged out.');
            expect(notifications[notifications.length - 3].getMessage()).toEqual('Logging in user.');
            expect(notifications[notifications.length - 2].getMessage()).toEqual('You are logged in.');
            expect(_.last(notifications).getMessage()).toEqual('Loading challenge detail.');

            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h1>');
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h2>Prizes</h2>');
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h2>Meta</h2>');
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h2>Specification</h2>');
            expect(atom.workspace.getActivePaneItem().getElement().innerHTML).toContain('<h2>Submission Guidelines</h2>');
        });
    });
});
