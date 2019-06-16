'use babel';

import TopcoderWorkflow from '../lib/topcoder-workflow';


describe('TopcoderWorkflow', () => {
    let workspaceElement, activationPromise;

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace);
        activationPromise = atom.packages.activatePackage('topcoder-workflow');
    });

    describe('when the topcoder:toggle event is triggered', () => {
        it('hides and shows the modal panel', () => {

            atom.commands.dispatch(workspaceElement, 'topcoder:toggle');

            waitsForPromise(() => {
                return activationPromise;
            });

            runs(() => {

                let topcoderElement = workspaceElement.querySelector('.topcoder-workflow');
                expect(topcoderElement).toExist();

                let topcoderPanel = atom.workspace.panelForItem(topcoderElement);
                expect(topcoderPanel.isVisible()).toBe(true);
                atom.commands.dispatch(workspaceElement, 'topcoder:toggle');
                expect(topcoderPanel.isVisible()).toBe(false);
            });
        });

        // test shou/hide menu(ctrl-shift-h)
        it('hides and shows the view', () => {

            jasmine.attachToDOM(workspaceElement);

            atom.commands.dispatch(workspaceElement, 'topcoder:toggle');

            waitsForPromise(() => {
                return activationPromise;
            });

            runs(() => {
                let topcoderElement = workspaceElement.querySelector('.topcoder-workflow');
                expect(topcoderElement).toBeVisible();
                atom.commands.dispatch(workspaceElement, 'topcoder:toggle');
                expect(topcoderElement).not.toBeVisible();
            });
        });

        // test login menu(ctrl-shift-t)
        it('begin to login', () => {

            jasmine.attachToDOM(workspaceElement);

            atom.commands.dispatch(workspaceElement, 'topcoder:login');

            waitsForPromise(() => {
                return activationPromise;
            });

            runs(() => {
                let topcoderElement = workspaceElement.querySelector('.topcoder-workflow');
                expect(topcoderElement).toBeVisible();
            });
        });

        // test load menu(ctrl-shift-i)
        it('begin to load challenges', () => {

            jasmine.attachToDOM(workspaceElement);

            atom.commands.dispatch(workspaceElement, 'topcoder:load');

            waitsForPromise(() => {
                return activationPromise;
            });

            runs(() => {
                let topcoderElement = workspaceElement.querySelector('.topcoder-workflow');
                expect(topcoderElement).toBeVisible();
            });
        });

    });
});
