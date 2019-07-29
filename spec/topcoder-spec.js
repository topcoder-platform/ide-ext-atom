'use babel';

const _ = require('lodash');
const config = require('../config');
const testConfig = require('../config/test');
const { getWorkspacePath } = require('../lib/utils.js');
const fs = require('fs');
const nock = require('nock');
const mock = require('mock-fs');
const testData = require('./test-data');

const activeChallengesQuery = '?filter=status%3DACTIVE';

describe('TopcoderWorkflow E2E tests', () => {
    let workspaceElement;

    beforeEach(() => {
      // mock requests/responses
      nock(/\.com/)
        .persist()
        .get(testConfig.TC.CHALLENGES_API_PATH + activeChallengesQuery)
        .reply(200, testData.validGetChallengesResponse)
        .get(testConfig.TC.CHALLENGES_API_PATH + '11111') // valid challengeId
        .reply(200, testData.validGetChallengeResponse)
        .get(testConfig.TC.CHALLENGES_API_PATH + '12345') // unregistered user
        .reply(200, testData.unregisteredChallengeResponse)
        .get(testConfig.TC.CHALLENGES_API_PATH + '123456') // non-existent challenge
        .reply(404)
        .get(testConfig.TC.CHALLENGES_API_PATH + '1234567') // submission phase closed
        .reply(200, testData.closedPhaseChallengeResponse)
        .post(testConfig.TC.SUBMISSION_API_PATH)
        .reply(200, { id: 'test_submission_id' })
        .post(testConfig.TC.AUTHN_PATH, testData.correctLoginRequestBody)
        .reply(200, { id_token: 'test', refresh_token: 'test' })
        .post(testConfig.TC.AUTHZ_PATH, testData.validAuthZRequestBody)
        .reply(200, testData.validAuthZResponse)
        .post(testConfig.TC.AUTHN_PATH, testData.incorrectLoginRequestBody)
        .reply(403);
      workspaceElement = atom.views.getView(atom.workspace);
      waitsForPromise(() => atom.packages.activatePackage('topcoder-workflow'));
      atom.config.set(`${config.EXT_NAME}.username`, testConfig.USERNAME);
      atom.config.set(`${config.EXT_NAME}.password`, testConfig.PASSWORD);
    });

    afterEach(async () => {
      nock.cleanAll();
      mock.restore();
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

    // test upload submission without .topcoderrc
    it('begin to upload submission without .topcoderrc', () => {
      atom.commands.dispatch(workspaceElement, 'topcoder:uploadSubmission');

      waitsFor(() => {
          if (atom.notifications.getNotifications().length > 0) {
              return _.last(atom.notifications.getNotifications()).getMessage() === config.WARN_MESSAGES.MISSING_TOPCODERRC_FILE;
          }
      }, 'Timeout issue in testing upload submission', testConfig.TIMEOUT);
    });

    // test upload submission with empty .topcoderrc
    it('begin to upload submission with empty .topcoderrc', () => {
      // mock-fs uses forward slashes - even on windows
      const workspacePath = getWorkspacePath().replace(/\\/g, '/');
      const opts = {};
      opts[workspacePath + '/.topcoderrc'] = ''; // empty content
      mock(opts);
      atom.commands.dispatch(workspaceElement, 'topcoder:uploadSubmission');

      waitsFor(() => {
          if (atom.notifications.getNotifications().length > 0) {
              return _.last(atom.notifications.getNotifications()).getMessage() === config.WARN_MESSAGES.INCORRECT_FORMAT_TOPCODERRC;
          }
      }, 'Timeout issue in testing upload submission', testConfig.TIMEOUT);
    });

    // test upload submission without challengeId
    it('begin to upload submission without challengeId', () => {
      // mock-fs uses forward slashes - even on windows
      const workspacePath = getWorkspacePath().replace(/\\/g, '/');
      const opts = {};
      opts[workspacePath + '/.topcoderrc'] = JSON.stringify({ challengeId: "" });
      mock(opts);
      atom.commands.dispatch(workspaceElement, 'topcoder:uploadSubmission');

      waitsFor(() => {
          if (atom.notifications.getNotifications().length > 0) {
              return _.last(atom.notifications.getNotifications()).getMessage() === config.WARN_MESSAGES.MISSING_CHALLENGE_ID;
          }
      }, 'Timeout issue in testing upload submission', testConfig.TIMEOUT);
    });

    // test upload submission with non-existent challengeId
    it('begin to upload submission with non-existent challengeId', () => {
      // mock-fs uses forward slashes - even on windows
      const workspacePath = getWorkspacePath().replace(/\\/g, '/');
      const opts = {};
      opts[workspacePath + '/.topcoderrc'] = JSON.stringify({ challengeId: "123456" });
      mock(opts);
      atom.commands.dispatch(workspaceElement, 'topcoder:uploadSubmission');

      waitsFor(() => {
          if (atom.notifications.getNotifications().length > 0) {
              return _.last(atom.notifications.getNotifications()).getMessage() === config.WARN_MESSAGES.CHALLENGE_NOT_FOUND;
          }
      }, 'Timeout issue in testing upload submission', testConfig.TIMEOUT);
    });

    // test upload submission with unregistered user
    it('begin to upload submission with unregistered user', () => {
      // mock-fs uses forward slashes - even on windows
      const workspacePath = getWorkspacePath().replace(/\\/g, '/');
      const opts = {};
      opts[workspacePath + '/.topcoderrc'] = JSON.stringify({ challengeId: "12345" });
      mock(opts);
      atom.commands.dispatch(workspaceElement, 'topcoder:uploadSubmission');

      waitsFor(() => {
          if (atom.notifications.getNotifications().length > 0) {
              return _.last(atom.notifications.getNotifications()).getMessage() === config.WARN_MESSAGES.NOT_REGISTERED_FOR_CHALLENGE;
          }
      }, 'Timeout issue in testing upload submission', testConfig.TIMEOUT);
    });

    // test upload submission with closed submission phase
    it('begin to upload submission with closed submission phase', async () => {
      // mock-fs uses forward slashes - even on windows
      const workspacePath = getWorkspacePath().replace(/\\/g, '/');
      const opts = {};
      opts[workspacePath + '/.topcoderrc'] = JSON.stringify({ challengeId: "1234567" });
      mock(opts);
      atom.commands.dispatch(workspaceElement, 'topcoder:uploadSubmission');

      waitsFor(() => {
          if (atom.notifications.getNotifications().length > 0) {
              return _.last(atom.notifications.getNotifications()).getMessage() === config.WARN_MESSAGES.SUBMISSION_PHASE_NOT_OPEN;
          }
      }, 'Timeout issue in testing upload submission', testConfig.TIMEOUT);
    });

    // test upload submission with valid workspace
    it('begin to upload submission with valid workspace', () => {
      const beforeLength = atom.notifications.getNotifications().length;
      // mock-fs uses forward slashes - even on windows
      const workspacePath = getWorkspacePath().replace(/\\/g, '/');
      const opts = {};
      opts[workspacePath + '/.topcoderrc'] = JSON.stringify({ challengeId: "11111" });
      mock(opts);
      atom.commands.dispatch(workspaceElement, 'topcoder:uploadSubmission');

      waitsFor(() => {
          if (atom.notifications.getNotifications().length > 0) {
              return _.last(atom.notifications.getNotifications()).getMessage() === 'Your submission ID: test_submission_id';
          }
      }, 'Timeout issue in testing upload submission', testConfig.TIMEOUT);
      runs(() => {
          notifications = atom.notifications.getNotifications();
          expect(notifications.length).toEqual(beforeLength + 6);
          expect(notifications[notifications.length - 4].getMessage()).toEqual(config.INFO_MESSAGES.ARCHIVING_WORKSPACE);
          expect(notifications[notifications.length - 3].getMessage()).toEqual(config.INFO_MESSAGES.UPLOADING_SUBMISSION);
          expect(notifications[notifications.length - 2].getMessage()).toEqual(config.INFO_MESSAGES.UPLOADED_SUBMISSION);
          expect(_.last(notifications).getMessage()).toEqual('Your submission ID: test_submission_id');
      });
    });
});
