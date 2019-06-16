'use babel';

const {
    e,
    appendHtml,
    isCredentialsValid,
} = require('./utils.js');

/**
 * [TopcoderWorkflowView view class of topcoder-workflow package]
 */
export default class TopcoderWorkflowView {

    constructor(serializedState) {
        // create root element
        this.element = document.createElement('div');
        this.element.classList.add('topcoder-workflow');

        this.initPlaceholder();

    }

    // returns an object that can be retrieved when package is activated
    serialize() {}

    // tear down any state and detach
    destroy() {
        this.element.remove();
    }

    // get root element
    getElement() {
        return this.element;
    }

    // insert placeholders to root element
    initPlaceholder() {
        const t = this.placeholderTemplate();
        appendHtml(this.element, t);
    }

    /**
     * [placeholderTemplate html template of placeholders]
     * @return {[string]} [html string]
     */
    placeholderTemplate() {
        const html = `
            <div class="topcoder-title f-row">
                <div class="title-text">Topcoder</div>
                <div class="login-panel-action">
                    <button href="javascript:;" class="tp-hide-button btn ">Hide(ctrl-shift-H)</button>
                </div>
            </div>
            <div class="placeholders">
                <div class="login-panel panel-box">
                    <div class="login-panel-text">
                        ${
                            isCredentialsValid() ?
                            'Please login' :
                            'Please set topcoder username/password in ~/.atom/packages/topcoder-workflow/config/index.js'
                        }
                    </div>
                    <button href="javascript:;" class="tp-login-button btn">Login(ctrl-shift-T)</button>
                </div>

                <div class="challenge-list ">
                    <div class="challenge-panel panel-box">
                        <div class="challenge-panel-text">
                            Active challenges
                        </div>
                        <div class="challenge-panel-action">
                            <button href="javascript:;" class="tp-challenge-load-button btn">Load(ctrl-shift-I)</button>
                        </div>
                    </div>
                    <div class="challenge-list-data">
                        <div class="challenge-error-mask f-center">
                            No Data
                        </div>
                    </div>
                </div>
            </div>
        `;
        return html;
    }

    /**
     * [displayChallenges create html from challenge array, then insert to challenge list placeholder]
     * @param  {[array]} challenges [response.result.content]
     */
    displayChallenges(challenges) {
        let html = ``;
        const t = typeof challenges;
        // get error message when loading challenge, just display the error string
        if (t === 'string') {
            html = `
                <div class="challenge-error-mask f-center">
                    ${challenges}
                </div>
            `;
        } else {
            html = `<table class="challenge-table">
                        <tr>
                            <th scope="col">Challenge Name</th>
                            <th scope="col">Challenge Type</th>
                            <th scope="col">Number of registrants</th>
                            <th scope="col">Prizes</th>
                            <th scope="col">Current Phase</th>
                        </tr>
            `;

            for (let challenge of challenges) {
                const item = this.challengeItem(challenge);
                html += item;
            }
            html += `</html>`;
        }

        const dataElement = e('.challenge-list-data');
        dataElement.innerHTML = '';
        appendHtml(dataElement, html);
    }

    /**
     * [challengeItem html template of challenge item]
     * @param  {[object]} challenge [challenge object]
     * @return {[string]}           [html string]
     */
    challengeItem(challenge) {
        const c = challenge;
        const html = `
            <tr class="challenge-item">
                <td class="challenge-name">${c.name}</td>
                <td class="challenge-type">${c.subTrack}</td>
                <td class="challenge-reg-num">${c.numRegistrants}</td>
                <td class="challenge-prizes">
                    ${c.prizes.map((p) => {
                       return `<span class="prizes-tag">${p}</span>`
                    }).join(' ')}
                </td>
                <td class="challenge-phase">
                    ${c.currentPhases.map((p) => {
                       return p.phaseType
                    }).join(', ')}
                </td>
            </tr>
        `;
        return html;
    }

    /**
     * [loadingTemplate get a loading spinner html]
     * @param  {[integer]} width  [icon width]
     * @param  {[integer]} height [icon height]
     * @param  {[string]} id     [element id of spinner]
     * @return {[string]}        [html string]
     */
    loadingTemplate(width, height, id) {
        const html = `
        <div class="loading f-center" id="${id}">
            <svg width="${width}px"  height="${height}px"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-dual-ring">
                <circle cx="50" cy="50" ng-attr-r="{{config.radius}}" ng-attr-stroke-width="{{config.width}}" ng-attr-stroke="{{config.stroke}}" ng-attr-stroke-dasharray="{{config.dasharray}}" fill="none" stroke-linecap="round" r="27" stroke-width="7" stroke="#39cccc" stroke-dasharray="42.411500823462205 42.411500823462205" transform="rotate(60 50 50)">
                  <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform>
                </circle>
              </svg>
        </div>
        `;
        return html
    }

    /**
     * [insertLoading insert a loading spinner to placeholders]
     */
    insertLoading() {
        const panel = e('.placeholders');
        const t = this.loadingTemplate(80, 80, 'loading-mask');
        appendHtml(panel, t);
    }

    /**
     * [removeLoading remove loading spinner]
     */
    removeLoading() {
        const loading = e('#loading-mask');
        loading.remove();
    }

    /**
     * [setLoginText when login success or fail, insert some messaage]
     */
    setLoginText(html) {
        const panel = e('.login-panel-text');
        panel.innerHTML = html;
    }

}
