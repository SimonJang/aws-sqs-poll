'use strict';

const assert = require('assert');
const Module = require('module');
const originalLoad = Module._load;
const calls = {
	getQueueUrl: [],
	receiveMessage: []
};

Module._load = function (request, parent, isMain) {
	if (request === 'aws-sdk') {
		return {
			SQS: function () {
				return {
					getQueueUrl: function (options) {
						calls.getQueueUrl.push(options);
						return {promise: async function () { return {QueueUrl: 'queue-url'}; }};
					},
					receiveMessage: function (options) {
						calls.receiveMessage.push(options);
						return {promise: async function () { return {Messages: []}; }};
					}
				};
			}
		};
	}

	return originalLoad.call(this, request, parent, isMain);
};

const poll = require('..');
Module._load = originalLoad;

poll('orders.fifo', {timeout: undefined, numberOfMessages: undefined})
	.then(function (messages) {
		assert.deepStrictEqual(messages, []);
		assert.strictEqual(calls.getQueueUrl[0].QueueName, 'orders.fifo');
		assert.deepStrictEqual(calls.receiveMessage[0], {
			QueueUrl: 'queue-url',
			MaxNumberOfMessages: 10,
			WaitTimeSeconds: 0
		});
	})
	.catch(function (error) {
		console.error(error);
		process.exitCode = 1;
	});
