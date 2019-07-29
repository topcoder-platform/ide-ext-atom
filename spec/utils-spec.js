'use babel';

const config = require('../config');
const testConfig = require('../config/test');
const nock = require('nock');
const mock = require('mock-fs');
const testData = require('./test-data');
const fs = require('fs');
const os = require('os');
const {
  getReqHeaders, includesFileUpload, getUserIdFromToken,
  getUserNameFromToken, getWorkspacePath, getIgnoreRules,
  getChallengeId, zipWorkspace, ensureChallengeIsSubmittable,
  uploadArchive } = require('../lib/utils.js');

describe('Utils Unit Tests', () => {
    beforeEach(() => {
      // mock requests/responses
      nock(/\.com/)
        .persist()
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
        .reply(200, { token: 'test_token' })
        .post(testConfig.TC.AUTHN_PATH, testData.incorrectLoginRequestBody)
        .reply(403);
    });

    afterEach(() => {
      nock.cleanAll();
      mock.restore();
    });

    it('getReqHeaders should return default headers', () => {
      const headers = getReqHeaders('test_token');
      expect(headers['content-type']).toBe('application/json');
      expect(headers['authorization']).toBe('Bearer test_token');
    });

    it('getReqHeaders should return provided headers', () => {
      const additionalHeaders = {
        'Content-Type': 'multipart/form-data',
        'Test-Header': 'test_header'
      };
      const headers = getReqHeaders('test_token', additionalHeaders);
      expect(headers['content-type']).toBe('multipart/form-data');
      expect(headers['authorization']).toBe('Bearer test_token');
      expect(headers['test-header']).toBe('test_header');
    });

    it('includesFileUpload should return true', () => {
      mock({
        'mock.file': 'DummyContent',
      }, { createCwd: false })
      const formData = {
        'file_upload': fs.createReadStream('mock.file'),
        'anotherfield': 'test'
      };
      const result = includesFileUpload(formData);
      expect(result).toBe(true);
    });

    it('includesFileUpload should return false', () => {
      const formData = {
        'anotherfield': 'test'
      };
      const result = includesFileUpload(formData);
      expect(result).toBe(false);
    });

    it('getUserNameFromToken should return test_user', () => {
      const result = getUserNameFromToken(testConfig.TEST_TOKEN);
      expect(result).toBe('test_user');
    });

    it('getUserIdFromToken should return 1', () => {
      const result = getUserIdFromToken(testConfig.TEST_TOKEN);
      expect(result).toBe(1);
    });

    it('getWorkspacePath should return path', () => {
      try {
        const result = getWorkspacePath();
        expect(typeof result).toBe('string');
      } catch (err) {
        throw new Error('Should not throw here');
      }
    });

    it('getIgnoreRules should return only .git', async () => {
      try {
        mock({
          'path/to/the/workspace': {
            'file-to-submit.txt': 'Test content'
          }
        }, { createCwd: false });
        const result = await getIgnoreRules('path/to/the/workspace');
        expect(result.length).toBe(1);
        expect(result[0]).toBe('.git');
      } catch (err) {
        throw new Error('Should not throw here');
      }
    });

    it('getIgnoreRules should return ignore rules', async () => {
      try {
        mock({
          'path/to/the/workspace': {
            'file-to-submit.txt': 'Test content',
            '.gitignore': 'test_dir'
          }
        }, { createCwd: false });
        const result = await getIgnoreRules('path/to/the/workspace');
        expect(result.length).toBe(2);
        expect(result.includes('test_dir')).toBe(true);
      } catch (err) {
        throw new Error('Should not throw here');
      }
    });

    it('getChallengeId should return 11111', async () => {
      try {
        mock({
          'path/to/the/workspace': {
            'file-to-submit.txt': 'Test content',
            '.topcoderrc': JSON.stringify({ challengeId: "11111" })
          }
        }, { createCwd: false });
        const result = await getChallengeId('path/to/the/workspace');
        expect(result).toBe('11111');
      } catch (err) {
        throw new Error('Should not throw here');
      }
    });

    it('zipWorkspace should create an archive', async () => {
      try {
        mock({
          'path/to/the/workspace': {
            'file-to-submit.txt': 'Test content',
            '.topcoderrc': JSON.stringify({ challengeId: "11111" })
          }
        }, { createCwd: false });
        const result = await zipWorkspace('path/to/the/workspace');
        const exist = fs.existsSync(result);
        expect(exist).toBe(true);
        // fs.unlink(result);
      } catch (err) {
        throw new Error('Should not throw here');
      }
    });

    it('ensureChallengeIsSubmittable should throw not found error', async () => {
      try {
        await ensureChallengeIsSubmittable('123456', testConfig.TEST_TOKEN);
        throw new Error('Should not throw here');
      } catch (err) {
        expect(err).toBe(config.WARN_MESSAGES.CHALLENGE_NOT_FOUND);
      }
    });

    it('ensureChallengeIsSubmittable should throw userNotRegistered error', async () => {
      try {
        await ensureChallengeIsSubmittable('12345', testConfig.TEST_TOKEN);
        throw new Error('Should not throw here');
      } catch (err) {
        expect(err).toBe(config.WARN_MESSAGES.NOT_REGISTERED_FOR_CHALLENGE);
      }
    });

    it('ensureChallengeIsSubmittable should throw phase not open error', async () => {
      try {
        await ensureChallengeIsSubmittable('1234567', testConfig.TEST_TOKEN);
        throw new Error('Should not throw here');
      } catch (err) {
        expect(err).toBe(config.WARN_MESSAGES.SUBMISSION_PHASE_NOT_OPEN);
      }
    });

    it('ensureChallengeIsSubmittable should return true', async () => {
      try {
        const result = await ensureChallengeIsSubmittable('11111', testConfig.TEST_TOKEN);
        expect(result).toBe(true);
      } catch (err) {
        throw new Error('Should not throw here');
      }
    });

    it('uploadArchive should upload submission', async () => {
      try {
        mock({
          'mock.zip': 'DummyContent'
        }, { createCwd: false });
        const result = await uploadArchive('mock.zip', '11111', testConfig.TEST_TOKEN);
        expect(result.id).toBe('test_submission_id');
      } catch (err) {
        throw new Error('Should not throw here');
      }
    });
});
