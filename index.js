'use strict';
const AWS = require('aws-sdk');
const pify = require('pify');
const isAWSID = require('is-aws-account-id');

const sqs = new AWS.SQS();
const getQueueUrl = pify(sqs.getQueueUrl.bind(sqs));
const poll = pify(sqs.receiveMessage.bind(sqs));

module.exports = (queueName, opts) => {
	opts = Object.assign({
		timeout: 0,
		numberOfMessages: 10,
		json: false
	}, opts);

	if (typeof queueName !== 'string') {
		return Promise.reject(new TypeError(`Expected \`queueName\` to be of type \`string\`, got \`${typeof queueName}\``));
	}
	if (typeof opts.timeout !== 'number') {
		return Promise.reject(new TypeError(`Expected \`timeout\` to be of type \`number\`, got \`${typeof opts.timeout}\``));
	}
	if (typeof opts.numberOfMessages !== 'number') {
		return Promise.reject(new TypeError(`Expected \`numberOfMessages\` to be of type \`number\`, got \`${typeof opts.numberOfMessages}\``));
	}
	if (!/^[a-z0-9_-]{1,80}$/i.test(queueName)) {
		return Promise.reject(new TypeError('Invalid queue name'));
	}
	if (opts.awsAccountId && !isAWSID(opts.awsAccountId)) {
		return Promise.reject(new TypeError('Invalid AWS Account Id'));
	}

	return getQueueUrl(
		{
			QueueName: queueName,
			QueueOwnerAWSAccountId: opts.awsAccountId
		}
	)
	.then(data => {
		if (!data || !data.QueueUrl) {
			throw new TypeError(`Queue \`${queueName}\` not found`);
		}
		return data.QueueUrl;
	})
	.then(url => {
		return poll({
			QueueUrl: url,
			MaxNumberOfMessages: opts.numberOfMessages,
			WaitTimeSeconds: opts.timeout
		});
	})
	.then(data => {
		if (opts.json) {
			return data.Messages.map(message => {
				try {
					return JSON.parse(message.Body);
				} catch (err) {
					return message.Body;
				}
			});
		}
		return data.Messages;
	});
};
