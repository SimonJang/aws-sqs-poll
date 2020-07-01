'use strict';
const AWS = require('aws-sdk');
const isAwsAccountId = require('is-aws-account-id');

const sqs = new AWS.SQS();

module.exports = async (queueName, options) => {
	const defaultOptions = {
		timeout: 0,
		numberOfMessages: 10,
		json: false,
		...options
	};

	if (typeof queueName !== 'string') {
		throw new TypeError(`Expected \`queueName\` to be of type \`string\`, got \`${typeof queueName}\``);
	}

	if (typeof defaultOptions.timeout !== 'number') {
		throw new TypeError(`Expected \`timeout\` to be of type \`number\`, got \`${typeof defaultOptions.timeout}\``);
	}

	if (typeof defaultOptions.numberOfMessages !== 'number') {
		throw new TypeError(`Expected \`numberOfMessages\` to be of type \`number\`, got \`${typeof defaultOptions.numberOfMessages}\``);
	}

	if (!/^[\w-]{1,80}$/i.test(queueName)) {
		throw new TypeError('Invalid queue name');
	}

	if (defaultOptions.awsAccountId && !isAwsAccountId(defaultOptions.awsAccountId)) {
		throw new TypeError('Invalid AWS Account Id');
	}

	const url = await sqs.getQueueUrl({
		QueueName: queueName,
		QueueOwnerAWSAccountId: defaultOptions.awsAccountId
	}).promise();

	if (!url || !url.QueueUrl) {
		throw new TypeError(`Queue \`${queueName}\` not found`);
	}

	const data = await sqs.receiveMessage({
		QueueUrl: url.QueueUrl,
		MaxNumberOfMessages: defaultOptions.numberOfMessages,
		WaitTimeSeconds: defaultOptions.timeout,
		AttributeNames: ['ApproximateNumberOfMessages']
	}).promise();

	if (defaultOptions.json && data.Messages) {
		return data.Messages.map(message => {
			try {
				message.Body = JSON.parse(message.Body);
			} catch {
				// Do nothing
			}

			return message;
		});
	}

	return data.Messages ? data.Messages : [];
};
