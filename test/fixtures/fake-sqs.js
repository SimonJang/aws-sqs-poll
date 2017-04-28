'use strict'
const AWS = require('aws-sdk');
const sinon = require('sinon');

class SQS {
	getQueueUrl(opts, cb) {
		console.log('in getQueueUrl');
		if(opts['QueueName'] !== 'demoQueue'){
			cb(undefined, {QueueUrl: ''})
		}
		cb(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789111/demoQueue'})
	}
	receiveMessage(opts, cb) {
		console.log('in receiveMessage');
		cb(undefined, {Messages: ['message1', 'message2', 'message3']});
	}
}

const sqs = new SQS()

AWS.SQS = function () {
	return sqs;
};

module.exports = sqs;

const stubGetQueue = sinon.stub(sqs, 'getQueueUrl');
stubGetQueue.withArgs({QueueName: 'demoQueue', QueueOwnerAWSAccountId: '123456789111'}).yields(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789111/demoQueue'});
stubGetQueue.withArgs({QueueName: 'foobar', QueueOwnerAWSAccountId: '123456789111'}).yields(undefined, {QueueUrl: ''});
const stubReceiveMessage = sinon.stub(sqs, 'receiveMessage');
stubReceiveMessage.withArgs({QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789111/demoQueue', MaxNumberOfMessages: 10, WaitTimeSeconds: 0})
	.yields(undefined, {Messages: ['message1', 'message2', 'message3']});