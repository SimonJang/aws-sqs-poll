'use strict'
const AWS = require('aws-sdk');
const sinon = require('sinon');

class SQS {
	getQueueUrl(opts, cb) {
		if(opts.QueueName !== 'demoQueue' && opts.QueueName !== 'jsonQueue' && opts.QueueName !== 'mjsonQueue') {
			cb(undefined, null)
		}
		const accountId = opts.QueueOwnerAWSAccountId || '123456789111';
		cb(undefined, {QueueUrl: `https://sqs.eu-west-1.amazonaws.com/${accountId}/${opts.QueueName}`})
	}
	receiveMessage(opts, cb) {
		console.log(opts);
		cb(undefined, {Messages: ['message1', 'message2', 'message3']});
	}
}

const sqs = new SQS()

AWS.SQS = function () {
	return sqs;
};

module.exports = sqs;

const stubReceiveMessage = sinon.stub(sqs, 'receiveMessage');
stubReceiveMessage.withArgs({QueueUrl: "https://sqs.eu-west-1.amazonaws.com/123456789111/demoQueue", WaitTimeSeconds: 0, MaxNumberOfMessages: 10, AttributeNames: ['ApproximateNumberOfMessages']})
	.yields(undefined, {Messages: ['message1', 'message2', 'message3']});
const parsed = JSON.stringify({messages: ['message1', 'message2', 'message3'], description: 'someArray'});
stubReceiveMessage.withArgs({QueueUrl: "https://sqs.eu-west-1.amazonaws.com/123456789111/jsonQueue", WaitTimeSeconds: 0, MaxNumberOfMessages: 10, AttributeNames: ['ApproximateNumberOfMessages']})
	.yields(undefined, {Messages: [{Body: parsed, ReceiptHandle: '1234556789'}]});
stubReceiveMessage.withArgs({QueueUrl: "https://sqs.eu-west-1.amazonaws.com/123456789111/mjsonQueue", WaitTimeSeconds: 0, MaxNumberOfMessages: 10, AttributeNames: ['ApproximateNumberOfMessages']})
	.yields(undefined, {Messages: [{Body: parsed, ReceiptHandle: '1234556789'}, {Body: parsed, ReceiptHandle: '1233556789'}]});
