'use babel';

import TopcoderWorkflowView from '../lib/topcoder-workflow-view';

describe('TopcoderView', () => {

    it('Should create root element', () => {
        const v = new TopcoderWorkflowView();
        expect(v.getElement().classList.contains('topcoder-workflow')).toBe(true);
    });

    it('placeholderTemplate should return a html string', () => {
        const v = new TopcoderWorkflowView();
        const t = v.placeholderTemplate();
        expect(typeof t).toBe('string');
    });

    it('challengeItem should return a html table row', () => {
        const v = new TopcoderWorkflowView();
        const c = {
            name: 'challenge name',
            subTrack: 'code',
            numRegistrants: 30,
            prizes: [1000, 500],
            currentPhases: ['Register'],
        }
        const t = v.challengeItem(c);
        expect(typeof t).toBe('string');
        expect(t.trim().startsWith('<tr')).toBe(true);
    });

    it('loadingTemplate should return a html div with svg', () => {
        const v = new TopcoderWorkflowView();
        const t = v.loadingTemplate(50, 50, 'loading-mask');
        expect(typeof t).toBe('string');
        expect(t.includes('svg')).toBe(true);
    });

});
