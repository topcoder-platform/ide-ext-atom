
// utils

const config = require('../config');

const log = function(...arg) {
  console.log.apply(console, arguments);
}

/**
 * [get element object from page]
 * @param  {[string]} selector [selector]
 * @param  {[element]} parent   [html element]
 * @return {[element]}          [html element]
 */
const e = function(selector, parent) {
  let ele = null;
  if(!parent) {
    ele = document.querySelector(selector);
  } else {
    ele = parent.querySelector(selector);
  }
  return ele;
}

/**
 * [insert html string to a html elememt]
 * @param  {[element]} element [html element]
 * @param  {[string]} html    [html string]
 */
const appendHtml = function (element, html) {
  element.insertAdjacentHTML('beforeend', html)
}

/**
 * [bind event on element]
 * @param  {[element]}   element   [target element]
 * @param  {[string]}   eventName [event name]
 * @param  {Function} callback  [callback]
 */
const bindEvent = function(element, eventName, callback) {
    element.addEventListener(eventName, callback)
}

/**
 * [isCredentialsValid check if config credentials are valid]
 * @return {Boolean} [valid or invalid]
 */
const isCredentialsValid = () => {
    const u = config.TC.USERNAME;
    const p = config.TC.PASSWORD;
    if (u === '' || p === '') {
        return false;
    } else {
        return true;
    }
}

/**
 * Api utils
 */
var Api = function () {
}

// send ajax request
Api.prototype.sendRequest = function (method, url, form, token, callback) {
    var r = new XMLHttpRequest()
    r.open(method, url, true)
    r.setRequestHeader('Content-Type', 'application/json')
    // add token to header
    if (token) {
        r.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    r.onreadystatechange = () => {
        if(r.readyState === 4) {
            callback(r)
        }
    }

    var data = JSON.stringify(form)
    r.send(data)
}

//sed get request
Api.prototype.get = function (url, token, callback) {
    this.sendRequest('GET', url, {}, token, callback);
}

// send post request
Api.prototype.post = function (url, form, token, callback) {
    this.sendRequest('POST', url, form, token, callback);
}

// send put request
Api.prototype.post = function (url, form, token, callback) {
    this.sendRequest('PUT', url, form, token, callback);
}

// send delete request
Api.prototype.post = function (url, token, callback) {
    this.sendRequest('DELETE', url, {}, token, callback);
}

var api = new Api();

module.exports = {
    log,
    e,
    appendHtml,
    bindEvent,
    isCredentialsValid,
    api,
}
