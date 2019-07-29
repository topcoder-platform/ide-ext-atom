const config = require('../../config');
const testConfig = require('../../config/test');
const _ = require('lodash');

const validURLResponse = { object: "obj" };
const invalidURLResponse = "error";
const incorrectLoginRequestBody = {
  username: 'x',
  password: '123',
  client_id: config.TC.CLIENT_ID,
  sso: false,
  scope: 'openid profile offline_access',
  response_type: 'token',
  connection: config.TC.CLIENT_V2CONNECTION || 'LDAP',
  grant_type: 'password',
  device: 'Browser'
};
const correctLoginRequestBody = _.cloneDeep(incorrectLoginRequestBody);
correctLoginRequestBody.username = 'correct';
correctLoginRequestBody.password = 'correct';
const validAuthZRequestBody = {
  param: {
    externalToken: 'test',
    refreshToken: 'test'
  }
};
const validAuthZResponse = {
  result: {
    content: {
      token: testConfig.TEST_TOKEN
    }
  }
};
const validGetChallengesResponse = {
    "result": {
        "content": [
            {
                "updatedAt": "2019-05-07T21:27Z",
                "createdAt": "2018-09-03T15:28Z",
                "createdBy": "23274118",
                "updatedBy": "22838965",
                "technologies": [
                    "Other"
                ],
                "status": "ACTIVE",
                "track": "DEVELOP",
                "subTrack": "CODE",
                "name": "F2F Challenge - 1001",
                "reviewType": "INTERNAL",
                "id": 11111,
                "forumId": 31139,
                "numSubmissions": 73,
                "numRegistrants": 15,
                "numSubmitters": 9,
                "registrationStartDate": "2018-09-03T15:32:18.767Z",
                "registrationEndDate": "2020-09-13T15:31:00.000Z",
                "submissionEndDate": "2020-10-01T15:34:00.000Z",
                "platforms": [
                    "Other"
                ],
                "totalPrize": 15,
                "isPrivate": false,
                "upcomingPhase": {
                    "id": 753868,
                    "phaseType": "Iterative Review",
                    "phaseStatus": "Scheduled",
                    "scheduledStartTime": "2018-09-03T15:40:18.874Z",
                    "scheduledEndTime": "2018-09-04T15:40:00.000Z",
                    "duration": 86400000
                },
                "projectId": 7572,
                "currentPhases": [
                    {
                        "id": 753867,
                        "phaseType": "Registration",
                        "phaseStatus": "Open",
                        "scheduledStartTime": "2018-09-03T15:32:18.767Z",
                        "scheduledEndTime": "2020-09-13T15:31:00.000Z",
                        "actualStartTime": "2018-09-03T15:32:18.767Z",
                        "fixedStartTime": "2018-09-03T15:32:18.767Z",
                        "duration": 64022381233
                    },
                    {
                        "id": 753869,
                        "phaseType": "Submission",
                        "phaseStatus": "Open",
                        "scheduledStartTime": "2018-09-03T15:40:18.874Z",
                        "scheduledEndTime": "2020-10-01T15:34:00.000Z",
                        "actualStartTime": "2018-09-03T15:40:18.874Z",
                        "duration": 65577281126
                    }
                ],
                "allPhases": [
                    {
                        "id": 753867,
                        "phaseType": "Registration",
                        "phaseStatus": "Open",
                        "scheduledStartTime": "2018-09-03T15:32:18.767Z",
                        "scheduledEndTime": "2020-09-13T15:31:00.000Z",
                        "actualStartTime": "2018-09-03T15:32:18.767Z",
                        "fixedStartTime": "2018-09-03T15:32:18.767Z",
                        "duration": 64022381233
                    },
                    {
                        "id": 753868,
                        "phaseType": "Iterative Review",
                        "phaseStatus": "Scheduled",
                        "scheduledStartTime": "2018-09-03T15:40:18.874Z",
                        "scheduledEndTime": "2018-09-04T15:40:00.000Z",
                        "duration": 86400000
                    },
                    {
                        "id": 753869,
                        "phaseType": "Submission",
                        "phaseStatus": "Open",
                        "scheduledStartTime": "2018-09-03T15:40:18.874Z",
                        "scheduledEndTime": "2020-10-01T15:34:00.000Z",
                        "actualStartTime": "2018-09-03T15:40:18.874Z",
                        "duration": 65577281126
                    }
                ],
                "prizes": [
                    15
                ],
                "isTask": false,
                "isRegistered": false
            }
        ]
    }
};
const validGetChallengeResponse = {
    "id": "56959d11:16c23e311ee:-7c77",
    "result": {
        "success": true,
        "status": 200,
        "metadata": null,
        "content": {
            "subTrack": "CODE",
            "challengeTitle": "F2F Challenge - 1001",
            "challengeId": 11111,
            "projectId": 7884,
            "forumId": 70826,
            "detailedRequirements": "Dummy contest",
            "reviewScorecardId": 30001610,
            "numberOfCheckpointsPrizes": 0,
            "postingDate": "2019-07-10T16:35:42.916Z",
            "registrationEndDate": "2019-08-31T16:35:00.000Z",
            "submissionEndDate": "2019-08-31T16:42:00.000Z",
            "reviewType": "INTERNAL",
            "forumLink": "https://apps.topcoder.com/forums/?module=Category&categoryID=70826",
            "appealsEndDate": "2019-09-04T04:42:00.000Z",
            "currentStatus": "Active",
            "challengeCommunity": "develop",
            "directUrl": "https://www.topcoder.com/direct/contest/detail.action?projectId=30055217",
            "prizes": [
                1,
                1
            ],
            "terms": [
                {
                    "termsOfUseId": 20704,
                    "role": "Primary Screener",
                    "agreeabilityType": "Electronically-agreeable",
                    "title": "Standard Reviewer Terms v1.0",
                    "url": ""
                },
                {
                    "termsOfUseId": 20704,
                    "role": "Reviewer",
                    "agreeabilityType": "Electronically-agreeable",
                    "title": "Standard Reviewer Terms v1.0",
                    "url": ""
                },
                {
                    "termsOfUseId": 21303,
                    "role": "Submitter",
                    "agreeabilityType": "Electronically-agreeable",
                    "title": "Standard Terms for TopCoder Competitions v2.2",
                    "url": ""
                },
                {
                    "termsOfUseId": 20704,
                    "role": "Aggregator",
                    "agreeabilityType": "Electronically-agreeable",
                    "title": "Standard Reviewer Terms v1.0",
                    "url": ""
                },
                {
                    "termsOfUseId": 20704,
                    "role": "Specification Reviewer",
                    "agreeabilityType": "Electronically-agreeable",
                    "title": "Standard Reviewer Terms v1.0",
                    "url": ""
                },
                {
                    "termsOfUseId": 20704,
                    "role": "Final Reviewer",
                    "agreeabilityType": "Electronically-agreeable",
                    "title": "Standard Reviewer Terms v1.0",
                    "url": ""
                },
                {
                    "termsOfUseId": 20794,
                    "role": "Manager",
                    "agreeabilityType": "Non-electronically-agreeable",
                    "title": "Approved OR Managers - TopCoder Technical Team",
                    "url": "http://www.topcoder.com"
                },
                {
                    "termsOfUseId": 20893,
                    "role": "Copilot",
                    "agreeabilityType": "Non-electronically-agreeable",
                    "title": "TopCoder Master Services Agreement",
                    "url": "http://www.topcoder.com/wiki/download/attachments/35129137/Member+Master+Agreement+v0020409.pdf"
                }
            ],
            "finalSubmissionGuidelines": "Dummy contest",
            "technologies": [
                "Other"
            ],
            "platforms": [
                "Other"
            ],
            "currentPhaseName": "Submission",
            "currentPhaseRemainingTime": 3280045,
            "currentPhaseEndDate": "2019-08-31T16:42:00.000Z",
            "registrants": [
                {
                    "reliability": null,
                    "colorStyle": "color: #00A900",
                    "rating": 1119,
                    "registrationDate": "2019-07-13T09:32:33.000Z",
                    "submissionDate": "2019-07-24T11:21:45.000Z",
                    "handle": "TonyJ"
                },
                {
                    "reliability": null,
                    "colorStyle": "color: #000000",
                    "registrationDate": "2019-07-13T14:21:34.000Z",
                    "submissionDate": "2019-07-15T19:14:25.000Z",
                    "handle": "callmekatootie"
                },
                {
                    "reliability": null,
                    "colorStyle": "color: #000000",
                    "registrationDate": "2019-07-14T02:44:34.000Z",
                    "submissionDate": "2019-07-24T09:13:53.000Z",
                    "handle": "mess"
                },
                {
                    "reliability": null,
                    "colorStyle": "color: #000000",
                    "registrationDate": "2019-07-14T02:45:48.000Z",
                    "submissionDate": "2019-07-17T12:59:10.000Z",
                    "handle": "pshah_customer"
                },
                {
                    "reliability": null,
                    "colorStyle": "color: #DDCC00",
                    "rating": 1716,
                    "registrationDate": "2019-07-15T14:52:42.000Z",
                    "submissionDate": "2019-07-15T14:58:41.000Z",
                    "handle": "lazybaer"
                },
                {
                    "reliability": null,
                    "colorStyle": "color: #6666FF",
                    "rating": 1463,
                    "registrationDate": "2019-07-19T23:09:29.000Z",
                    "handle": "test_user"
                }
            ],
            "phases": [
                {
                    "duration": 4492800000,
                    "actualStartTime": "2019-07-10T16:35:42.916Z",
                    "scheduledStartTime": "2019-07-10T16:35:42.916Z",
                    "phaseId": 768087,
                    "scheduledEndTime": "2019-08-31T16:35:00.000Z",
                    "fixedStartTime": "2019-07-10T13:00:00.000Z",
                    "type": "Registration",
                    "status": "Open"
                },
                {
                    "duration": 4492500000,
                    "actualStartTime": "2019-07-10T16:47:05.569Z",
                    "scheduledStartTime": "2019-07-10T16:47:05.569Z",
                    "phaseId": 768088,
                    "scheduledEndTime": "2019-08-31T16:42:00.000Z",
                    "type": "Submission",
                    "status": "Open"
                },
                {
                    "duration": 172800000,
                    "scheduledStartTime": "2019-08-31T16:42:00.000Z",
                    "phaseId": 768089,
                    "scheduledEndTime": "2019-09-02T16:42:00.000Z",
                    "type": "Review",
                    "status": "Scheduled"
                },
                {
                    "duration": 86400000,
                    "scheduledStartTime": "2019-09-02T16:42:00.000Z",
                    "phaseId": 768090,
                    "scheduledEndTime": "2019-09-03T16:42:00.000Z",
                    "type": "Appeals",
                    "status": "Scheduled"
                },
                {
                    "duration": 43200000,
                    "scheduledStartTime": "2019-09-03T16:42:00.000Z",
                    "phaseId": 768091,
                    "scheduledEndTime": "2019-09-04T04:42:00.000Z",
                    "type": "Appeals Response",
                    "status": "Scheduled"
                }
            ],
            "submissions": [
                {
                    "submitter": "callmekatootie",
                    "submitterId": 23124329,
                    "submissions": [
                        {
                            "submissionId": 208034,
                            "submissionStatus": "Active",
                            "submissionTime": "2019-07-15T19:14:25.000Z"
                        }
                    ]
                },
                {
                    "submitter": "TonyJ",
                    "submitterId": 8547899,
                    "submissions": [
                        {
                            "submissionId": 208398,
                            "submissionStatus": "Active",
                            "submissionTime": "2019-07-24T11:21:45.000Z"
                        }
                    ]
                },
                {
                    "submitter": "lazybaer",
                    "submitterId": 23225544,
                    "submissions": [
                        {
                            "submissionId": 208031,
                            "submissionStatus": "Active",
                            "submissionTime": "2019-07-15T14:58:41.000Z"
                        }
                    ]
                },
                {
                    "submitter": "mess",
                    "submitterId": 305384,
                    "submissions": [
                        {
                            "submissionId": 208394,
                            "submissionStatus": "Active",
                            "submissionTime": "2019-07-24T09:13:53.000Z"
                        }
                    ]
                },
                {
                    "submitter": "pshah_customer",
                    "submitterId": 40152922,
                    "submissions": [
                        {
                            "submissionId": 208060,
                            "submissionStatus": "Active",
                            "submissionTime": "2019-07-17T12:59:10.000Z"
                        }
                    ]
                }
            ],
            "checkpoints": [],
            "numberOfRegistrants": 6,
            "numberOfSubmissions": 5,
            "numberOfSubmitters": 5
        }
    },
    "version": "v3"
};
const unregisteredChallengeResponse = _.cloneDeep(validGetChallengeResponse);
_.set(unregisteredChallengeResponse, 'result.content.challengeId', 12345);
_.set(unregisteredChallengeResponse, 'result.content.registrants[5].handle', 'abcd');
const closedPhaseChallengeResponse = _.cloneDeep(validGetChallengeResponse);
_.set(closedPhaseChallengeResponse, 'result.content.challengeId', 1234567);
_.set(closedPhaseChallengeResponse, 'result.content.phases[1].status', 'Closed');
module.exports = {
  validURLResponse,
  invalidURLResponse,
  incorrectLoginRequestBody,
  correctLoginRequestBody,
  validGetChallengesResponse,
  validGetChallengeResponse,
  unregisteredChallengeResponse,
  closedPhaseChallengeResponse,
  validAuthZRequestBody,
  validAuthZResponse
};
