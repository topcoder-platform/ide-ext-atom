'use strict'

let config = {
  USERNAME: 'correct',
  PASSWORD: 'correct',
  TIMEOUT: 20000,
  TEST_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaGFuZGxlIjoidGVzdF91c2VyIiwidXNlcklkIjoxLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.DFYkiF5vIkxabtec5Dn-_6nZ0CezlEUJbjUoso2fGKc',
  NEW_USER_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaGFuZGxlIjoibmV3X3VzZXIiLCJ1c2VySWQiOjEsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.bo_n3HjCVPLBwxQk1Fupsz79WdO1IpGICVpar-lpO_I'
}
config.TC = {}
config.TC.BASE_API_URL = 'https://api.topcoder-dev.com'
config.TC.CHALLENGES_API_PATH = '/v4/challenges/'
config.TC.SUBMISSION_API_PATH = '/v5/submissions'
config.TC.AUTHN_PATH = '/oauth/ro'
config.TC.AUTHZ_PATH = '/v3/authorizations'
module.exports = config
