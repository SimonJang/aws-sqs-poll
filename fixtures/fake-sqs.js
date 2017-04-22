'use strict'
const AWS = require('aws-sdk');

class SQS {
	getQueueUrl(opts, cb) {
		console.log('FIXTURE :: executing function getQueueUrl');
		console.log('FIXTURE :: printing arguments for getQueueUrl', opts);
		if(opts['QueueName'] !== 'unknownQueue'){
			cb(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'})
		}
		cb(undefined, {QueueUrl: ''})
		
	}
	receiveMessage(opts, cb) {
		console.log('FIXTURE :: executing function getQueueUrl')
        console.log('FIXTURE :: printing arguments for receiveMessage', opts)
		cb(undefined, {Messages: ['message1', 'message2', 'message3']});
	}
}
const sqs = new SQS();

AWS.SQS = function () {
	return sqs;
};

module.exports = sqs;