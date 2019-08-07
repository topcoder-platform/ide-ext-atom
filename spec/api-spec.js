'use babel'

const {
  api
} = require('../lib/utils.js')

const TCAuth = require('../lib/auth/TCAuth')
const config = require('../config')
const testConfig = require('../config/test')
const nock = require('nock')
const testData = require('./test-data')

const invalidQuery = '?filter=status%3DACTIVExxxx'
const validQuery = '?filter=status%3DACTIVE'

describe('Topcoder Api', () => {
  beforeEach(() => {
    nock(/\.com/)
      .persist()
      .get(testConfig.TC.CHALLENGES_API_PATH + invalidQuery)
      .reply(403, testData.invalidURLResponse)
      .get(testConfig.TC.CHALLENGES_API_PATH + validQuery)
      .reply(200, testData.validURLResponse)
      .post(testConfig.TC.AUTHN_PATH, testData.incorrectLoginRequestBody)
      .reply(403)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('Should get error message with invalid url to load challenge', async () => {
    try {
      const url = testConfig.TC.BASE_API_URL + testConfig.TC.CHALLENGES_API_PATH + invalidQuery
      await api.get(url)
      throw new Error('Should not throw here')
    } catch (err) {
      expect(err.statusCode).toBe(403)
    }
  })

  it('Should get challenges array with valid url to load challenge', async () => {
    try {
      const url = testConfig.TC.BASE_API_URL + testConfig.TC.CHALLENGES_API_PATH + validQuery
      const response = await api.get(url)
      expect(typeof response).toBe('object')
    } catch (err) {
      throw new Error('Should not throw here')
    }
  })

  it('Should get error with invalid credentials to login', () => {
    const username = 'x'
    const password = '123'

    let tca = new TCAuth(config.TC, config.logger)
    tca.login(username, password, (err, accessToken) => {
      expect(err !== null).toBe(true)
    })
  })
})
