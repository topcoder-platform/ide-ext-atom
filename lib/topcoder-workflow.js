'use babel'
import TopcoderWebView from './topcoder-web-view'

import { CompositeDisposable } from 'atom'

const config = require('../config')
const logger = config.logger
const TCAuth = require('./auth/TCAuth')

const _ = require('lodash')
const {
  log,
  generateHtmlFromChallenges,
  generateHtmlFromChallenge,
  dismissLastNotification,
  getIgnoreRules,
  zipWorkspace,
  getWorkspacePath,
  getChallengeId,
  ensureChallengeIsSubmittable,
  uploadArchive,
  api
} = require('./utils')

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
    this.clearCache()

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that inserts this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'topcoder:login': () => this.login(),
      'topcoder:logout': () => this.logout(),
      'topcoder:viewOpenChallenges': () => this.viewOpenChallenges(),
      'topcoder:uploadSubmission': () => this.uploadSubmission()
    }))

    this.subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri.startsWith(this.uriPattern)) {
        if (uri.length === this.uriPattern.length) {
          if (this.openChallengesView) {
            this.openChallengesView.reload(generateHtmlFromChallenges(this.challenges))
            return this.openChallengesView
          } else {
            this.openChallengesView = new TopcoderWebView({ html: generateHtmlFromChallenges(this.challenges) })
            return this.openChallengesView
          }
        } else {
          if (this.challenge) {
            const param = { html: generateHtmlFromChallenge(this.challenge, this.getToken()), title: this.challenge.challengeTitle }
            this.challenge = null
            return new TopcoderWebView(param)
          } else {
            let challengeId = uri.substring(this.uriPattern.length + 1)
            this.viewChallenge(challengeId)
          }
        }
      }
    }))

    // create token refresh timeer
    this.refreshTimer = setInterval(() => {
      this.refreshToken()
    }, config.TC.TOKEN_REFRESH_TIME)
  },

  deactivate () {
    this.subscriptions.dispose()
    clearInterval(this.refreshTimer)
  },

  /**
   * [refreshToken send request to config.TC.TOKEN_REFRESH_URL to refresh the token]
   */
  async refreshToken () {
    const token = this.getToken()
    if (token === null) {
      return
    }
    const response = await api.get(config.TC.TOKEN_REFRESH_URL, token)
    const newToken = _.get(response, 'result.content.token', '')
    log('getting refresh token', newToken)
    if (newToken) {
      this.saveToken(newToken)
    }
  },

  /**
   * [login function]
   * @param  {[string]} lastAction [What user is doing before login(method name)]
   * @param  {[array]}  parameters [lastAction method parameters]
   */
  login (lastAction, parameters) {
    const username = atom.config.get(`${config.EXT_NAME}.username`)
    const password = atom.config.get(`${config.EXT_NAME}.password`)

    if (username.trim().length === 0) {
      atom.notifications.addWarning(config.WARN_MESSAGES.MISSING_USERNAME)
      return
    }
    if (password.trim().length === 0) {
      atom.notifications.addWarning(config.WARN_MESSAGES.MISSING_PASSWORD)
      return
    }

    atom.notifications.addInfo(config.INFO_MESSAGES.LOGGING_IN, { dismissable: true })

    let tca = new TCAuth(config.TC, logger)
    tca.login(username, password, (err, accessToken) => {
      if (err) {
        let message = _.get(err, 'error_description') || _.get(err, 'result.content') || err.message
        atom.notifications.addError(`Login failed, ${message} please check your username/password in configuration`, { dismissable: true })
      } else {
        _.last(atom.notifications.getNotifications()).dismiss()
        this.saveToken(accessToken)

        // when login success,
        // if user comes to login from loading challenges/challenge detail,
        // jump back to load challenges/challenge detail
        if (lastAction) {
          atom.notifications.addSuccess(config.INFO_MESSAGES.LOGGED_IN, { dismissable: true })
          const loginSuccessNotification = _.last(atom.notifications.getNotifications())
          setTimeout(() => { loginSuccessNotification.dismiss() }, 1000)

          switch (lastAction) {
            case 'viewOpenChallenges':
              this.viewOpenChallenges()
              break
            case 'uploadSubmission':
              this.uploadSubmission()
              break
            case 'viewChallenge':
              this.viewChallenge(...parameters)
              break
            case 'registerUserForChallenge':
              this.registerUserForChallenge(...parameters)
              break
          }
        } else {
          atom.notifications.addSuccess(config.INFO_MESSAGES.LOGGED_IN)
        }
      }
    })
  },

  /**
   * [logout function]
   */
  logout () {
    this.clearCache()
    atom.notifications.addSuccess(config.INFO_MESSAGES.LOGGED_OUT)
  },

  /**
   * [viewOpenChallenges render open challenges]
   */
  async viewOpenChallenges () {
    const token = this.getToken()
    // if not logged in, send login request
    if (token === null) {
      this.login('viewOpenChallenges')
      return
    }

    atom.notifications.addInfo(config.INFO_MESSAGES.LOADING_OPEN_CHALLENGES, { dismissable: true })
    try {
      const response = await api.get(config.TC.CHALLENGES_URL, token)
      this.challenges = _.get(response, 'result.content', [])
      _.last(atom.notifications.getNotifications()).dismiss()

      return atom.workspace.open(this.uriPattern, { searchAllPanes: true })
    } catch (err) {
      const message = this.getErrorMessage(err)
      atom.notifications.addError(`Fetch open challenges failed, ${message}`, { dismissable: true })
    }
  },

  /**
   * [viewChallenge render challenge detail]
   * @param  {[string]} challengeId [the challenge id]
   */
  async viewChallenge (challengeId) {
    const token = this.getToken()
    // if not logged in, send login request
    if (token === null) {
      this.login('viewChallenge', [challengeId])
      return
    }

    atom.notifications.addInfo(config.INFO_MESSAGES.LOADING_CHALLENGE, { dismissable: true })
    try {
      const response = await api.get(`${config.TC.CHALLENGE_URL}/${challengeId}`, token)
      this.challenge = _.get(response, 'result.content', {})
      _.last(atom.notifications.getNotifications()).dismiss()

      return atom.workspace.open(`${this.uriPattern}/${challengeId}`)
    } catch (err) {
      const message = this.getErrorMessage(err)
      atom.notifications.addError(`Fetch challenge detail failed, ${message}`, { dismissable: true })
    }
  },

  /**
   * Uploads the open workspace as challenge submissions
   */
  async uploadSubmission () {
    const token = this.getToken()
    // if not logged in, send login request
    if (token === null) {
      this.login('uploadSubmission')
      return
    }
    try {
      atom.notifications.addInfo(config.INFO_MESSAGES.START_UPLOAD_SUBMISSION, { dismissable: true })
      const workspacePath = getWorkspacePath()
      const challengeId = await getChallengeId(workspacePath)
      await ensureChallengeIsSubmittable(challengeId, token)
      const gitIgnoreRules = await getIgnoreRules(workspacePath)
      _.last(atom.notifications.getNotifications()).dismiss()
      atom.notifications.addInfo(config.INFO_MESSAGES.ARCHIVING_WORKSPACE, { dismissable: true })
      const zip = await zipWorkspace(workspacePath, gitIgnoreRules)
      dismissLastNotification(0)
      atom.notifications.addInfo(config.INFO_MESSAGES.UPLOADING_SUBMISSION, { dismissable: true })
      const submission = await uploadArchive(zip, challengeId, token)
      dismissLastNotification()
      atom.notifications.addInfo(config.INFO_MESSAGES.UPLOADED_SUBMISSION, { dismissable: true })
      atom.notifications.addInfo(`Your submission ID: ${submission.id}`, { dismissable: true })
      return
    } catch (err) {
      const message = typeof err === 'string' ? err : this.getErrorMessage(err)
      atom.notifications.addError(`Upload submission failed, ${message}`, { dismissable: true })
    }
  },

  /**
   * [registerUserForChallenge register user for given challenge]
   * @param  {[string]} challengeId [the challenge id]
   * @param  {[Object]} element     [the html element]
   */
  async registerUserForChallenge (challengeId, element) {
    const token = this.getToken()
    // if not logged in, send login request
    if (token === null) {
      this.login('registerUserForChallenge', [challengeId, element])
      return
    }
    atom.notifications.addInfo(config.INFO_MESSAGES.REGISTERING_MESSAGE, { dismissable: true })
    try {
      await api.post(`${config.TC.CHALLENGE_URL}/${challengeId}/register`, null, token)
      _.last(atom.notifications.getNotifications()).dismiss()
      // remove register button that user has just clicked
      const buttons = element.getElementsByTagName('button')
      if (buttons.length > 0) {
        buttons[0].remove()
      }
      atom.notifications.addSuccess(config.INFO_MESSAGES.REGISTERED_SUCCESS)
    } catch (err) {
      // enable the button again if error occurs
      const buttons = element.getElementsByTagName('button')
      if (buttons.length > 0) {
        buttons[0].disabled = false
        buttons[0].style.backgroundColor = null
      }
      const message = this.getErrorMessage(err)
      atom.notifications.addError(`Register challenge failed, ${message}`, { dismissable: true })
    }
  },

  /**
   * [saveToken store the token]
   * @param  {[string]} token [latest token]
   */
  saveToken (token) {
    localStorage.setItem('atom_topcoder_token', token)
  },

  /**
   * [getToken get the stored token]
   * @return {[string]} [token]
   */
  getToken () {
    const t = localStorage.getItem('atom_topcoder_token')
    return t
  },

  /**
   * [clearCache delete stored token]
   */
  clearCache () {
    localStorage.removeItem('atom_topcoder_token')
  },

  /**
   * [getErrorMessage retrieve detail error message]
   * @param {[Object]}  err [the error object]
   * @return {[string]} [the error message]
   */
  getErrorMessage (err) {
    let message = err.message
    try {
      // get the detail error message from http request response
      const error = JSON.parse(err.error)
      // the first is for v4 challenges api, the second is for v5 submissions api
      message = _.get(error, 'result.content') || _.get(error, 'message')
    } catch (err) {
      // ignore when the error is thrown by request-promise module
    }
    return message
  }
}
