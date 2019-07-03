'use strict';

let config = {
  USERNAME: process.env.TEST_USERNAME || '',
  PASSWORD: process.env.TEST_PASSWORD || '',
  TIMEOUT: 20000
};

module.exports = config;
