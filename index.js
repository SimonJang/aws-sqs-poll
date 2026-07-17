'use strict';
const AWS = require('aws-sdk');

module.exports = async (queueName, options) => {
	const defaultOptions = {
		timeout: 0,
		numberOfMessages: 10,
		json: false,
		...options
	};

	if (defaultOptions.timeout === undefined) {
		defaultOptions.timeout = 0;
	}

	if (defaultOptions.numberOfMessages === undefined) {
		defaultOptions.numberOfMessages = 10;
	}

	if (defaultOptions.json === undefined) {
		defaultOptions.json = false;
	}

	if (typeof queueName !== 'string') {
		throw new TypeError(`Expected \`queueName\` to be of type \`string\`, got \`${typeof queueName}\``);
	}

	if (typeof defaultOptions.timeout !== 'number') {
		throw new TypeError(`Expected \`timeout\` to be of type \`number\`, got \`${typeof defaultOptions.timeout}\``);
	}

	if (typeof defaultOptions.numberOfMessages !== 'number') {
		throw new TypeError(`Expected \`numberOfMessages\` to be of type \`number\`, got \`${typeof defaultOptions.numberOfMessages}\``);
	}

	if (typeof defaultOptions.json !== 'boolean') {
		throw new TypeError(`Expected \`json\` to be of type \`boolean\`, got \`${typeof defaultOptions.json}\``);
	}

	if (!Number.isInteger(defaultOptions.timeout) || defaultOptions.timeout < 0 || defaultOptions.timeout > 20) {
		throw new RangeError('`timeout` must be an integer between 0 and 20');
	}

	if (!Number.isInteger(defaultOptions.numberOfMessages) || defaultOptions.numberOfMessages < 1 || defaultOptions.numberOfMessages > 10) {
		throw new RangeError('`numberOfMessages` must be an integer between 1 and 10');
	}

	if (!/^(?:[A-Za-z0-9_-]{1,80}|[A-Za-z0-9_-]{1,75}\.fifo)$/.test(queueName)) {
		throw new TypeError('Invalid queue name');
	}

	if (
		defaultOptions.awsAccountId !== undefined &&
		(typeof defaultOptions.awsAccountId !== 'string' || !/^[0-9]{12}$/.test(defaultOptions.awsAccountId))
	) {
		throw new TypeError('Invalid AWS Account Id');
	}

	const sqs = new AWS.SQS();

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
		WaitTimeSeconds: defaultOptions.timeout
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
