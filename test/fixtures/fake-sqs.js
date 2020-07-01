'use strict';
const AWS = require('aws-sdk');

class SQS {
	getQueueUrl(options) {
		if (options.QueueName !== 'demoQueue' && options.QueueName !== 'jsonQueue' && options.QueueName !== 'mjsonQueue') {
			return {
				promise: async () => {
					return Promise.resolve(null);
				}
			};
		}

		const accountId = options.QueueOwnerAWSAccountId || '123456789111';

		return {
			promise: async () => {
				return Promise.resolve({QueueUrl: `https://sqs.eu-west-1.amazonaws.com/${accountId}/${options.QueueName}`});
			}
		};
	}

	receiveMessage({QueueUrl}) {
		return {
			promise: async () => {
				if (QueueUrl === 'https://sqs.eu-west-1.amazonaws.com/123456789111/demoQueue') {
					return Promise.resolve({Messages: ['message1', 'message2', 'message3']});
				}

				const parsed = JSON.stringify({messages: ['message1', 'message2', 'message3'], description: 'someArray'});

				if (QueueUrl === 'https://sqs.eu-west-1.amazonaws.com/123456789111/jsonQueue') {
					return Promise.resolve({Messages: [{Body: parsed, ReceiptHandle: '1234556789'}]});
				}

				if (QueueUrl === 'https://sqs.eu-west-1.amazonaws.com/123456789111/mjsonQueue') {
					return Promise.resolve({Messages: [{Body: parsed, ReceiptHandle: '1234556789'}, {Body: parsed, ReceiptHandle: '1233556789'}]});
				}
			}
		};
	}
}

const sqs = new SQS();

AWS.SQS = function () {
	return sqs;
};

module.exports = sqs;
