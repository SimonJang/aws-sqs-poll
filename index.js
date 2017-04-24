'use strict';
const AWS = require('aws-sdk');
const pify = require('pify');

const sqs = new AWS.SQS();
const getQueueUrl = pify(sqs.getQueueUrl.bind(sqs));
const poll = pify(sqs.receiveMessage.bind(sqs));

module.exports = (queueName, options) => {
	options = Object.assign({
		awsAccountId: process.env.AWS_ACCOUNT_ID,
		MaxNumberOfMessages: 10
	}, options);

	if (!queueName) {
		return Promise.reject(new TypeError('Please provide a queue name'));
	}
	if (queueName.length > 80 || !/^[a-zA-Z0-9_-]{1,80}$/i.test(queueName)) {
		return Promise.reject(new TypeError('Invalid queue name'));
	}
	if (!options.awsAccountId || options.awsAccountId.length !== 12 || !/([0-9]{12})+/i.test(options.awsAccountId)) {
		return Promise.reject(new TypeError('Invalid queueOwnerId'));
	}

	return getQueueUrl(
		{
			QueueName: queueName,
			QueueOwnerId: options.awsAccountId
		}
	).then(urlQueueResponse => {
		if (urlQueueResponse.QueueUrl && urlQueueResponse.QueueUrl.length !== 0) {
			return urlQueueResponse.QueueUrl;
		}
		return Promise.reject(new TypeError('Queue not found'));
	}).then(url => {
		return {
			QueueUrl: url,
			MaxNumberOfMessages: options.MaxNumberOfMessages
		};
	}).then(params => poll(params));
};
