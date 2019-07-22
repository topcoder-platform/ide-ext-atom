'use babel';

const {
    api,
} = require('../lib/utils.js');

const TCAuth = require('../lib/auth/TCAuth');
const config = require('../config');

describe('Topcoder Api', () => {
    it('Should get error message with invalid url to load challenge', () => {
        const invalidUrl = 'https://api.topcoder.com/v4/challenges/?filter=status%3DACTIVExxxx';
        api.get(invalidUrl, null, (res) => {
            const response = JSON.parse(res.response);
            const content = response.result.content;
            expect(typeof content).toBe('string');
        });
    });

    it('Should get challenges array with valid url to load challenge', () => {
        const validUrl = 'https://api.topcoder.com/v4/challenges/?filter=status%3DACTIVE';
        api.get(validUrl, null, (res) => {
            const response = JSON.parse(res.response);
            const content = response.result.content;
            expect(typeof content).toBe('object');
        });
    });

    it('Should get error with invalid credentials to login', () => {
        const username = 'x';
        const password = '123';

        let tca = new TCAuth(config.TC, config.logger);
        tca.login(username, password, (err, accessToken) => {
            expect(err !== null).toBe(true);
        })
    });

});
