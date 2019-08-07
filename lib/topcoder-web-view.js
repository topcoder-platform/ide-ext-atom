'use babel'

import workflow from './topcoder-workflow'

module.exports = class TopcoderWebView {
  // constructor
  constructor (serializedState) {
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'topcoder-workflow')
    this.element.innerHTML = serializedState.html
    this.title = serializedState.title
    this.element.addEventListener('click', (event) => {
      if (event.path[0].href && event.path[0].href.startsWith(workflow.uriPattern)) {
        let challengeId = event.path[0].href.substring(workflow.uriPattern.length + 1)
        workflow.viewChallenge(challengeId)
      } else if (event.path[0].id === 'registerButton') {
        // disable the button
        event.path[0].disabled = true
        event.path[0].style.backgroundColor = 'silver'
        workflow.registerUserForChallenge(event.path[0].name, this.element)
      }
    })
  }

  // get title
  getTitle () {
    return this.title || 'Topcoder: Open challenges'
  }

  // reload the web view with passing html
  reload (html) {
    this.element.innerHTML = html
  }

  // destroy the web view
  destroy () {
    this.element.remove()
  }

  // getter for web view document element
  getElement () {
    return this.element
  }
}
