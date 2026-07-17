'use strict';

const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

const modulePath = require.resolve('..');

const createHarness = ({queueUrl, messages, getQueueUrlError, receiveMessageError} = {}) => {
	const calls = {
		getQueueUrl: [],
		receiveMessage: []
	};

	const sqs = {
		getQueueUrl(options) {
			calls.getQueueUrl.push(options);

			return {
				promise: async () => {
					if (getQueueUrlError) {
						throw getQueueUrlError;
					}

					return queueUrl === null ? null : {QueueUrl: queueUrl || 'https://sqs.eu-west-1.amazonaws.com/123456789012/demoQueue'};
				}
			};
		},
		receiveMessage(options) {
			calls.receiveMessage.push(options);

			return {
				promise: async () => {
					if (receiveMessageError) {
						throw receiveMessageError;
					}

					return messages === undefined ? {} : {Messages: messages};
				}
			};
		}
	};

	const originalLoad = Module._load;
	Module._load = function (request, parent, isMain) {
		if (request === 'aws-sdk') {
			return {SQS: function () { return sqs; }};
		}

		if (request === 'is-aws-account-id') {
			return value => /^[0-9]{12}$/.test(value);
		}

		return originalLoad.call(this, request, parent, isMain);
	};

	delete require.cache[modulePath];
	let poll;
	try {
		poll = require('..');
	} finally {
		Module._load = originalLoad;
	}

	return {calls, poll};
};

test('rejects missing and invalid queue names before calling AWS', async () => {
	const {calls, poll} = createHarness();

	await assert.rejects(poll(), {
		name: 'TypeError',
		message: 'Expected `queueName` to be of type `string`, got `undefined`'
	});
	await assert.rejects(poll('l[7777&&]l'), {name: 'TypeError', message: 'Invalid queue name'});
	assert.equal(calls.getQueueUrl.length, 0);
});

test('accepts standard and FIFO queue names', async () => {
	const {calls, poll} = createHarness({messages: []});

	await poll('demoQueue');
	await poll('demoQueue.fifo');
	await poll('a'.repeat(80));
	await poll(`${'a'.repeat(75)}.fifo`);

	assert.deepEqual(calls.getQueueUrl.map(call => call.QueueName), [
		'demoQueue',
		'demoQueue.fifo',
		'a'.repeat(80),
		`${'a'.repeat(75)}.fifo`
	]);
	await assert.rejects(poll(`${'a'.repeat(76)}.fifo`), {name: 'TypeError', message: 'Invalid queue name'});
});

test('validates account IDs before calling AWS', async () => {
	const {calls, poll} = createHarness();

	for (const awsAccountId of ['1vavaf2', '', 123456789012]) {
		await assert.rejects(poll('demoQueue', {awsAccountId}), {
			name: 'TypeError',
			message: 'Invalid AWS Account Id'
		});
	}
	assert.equal(calls.getQueueUrl.length, 0);
});

test('uses documented defaults and returns an empty array when AWS has no messages', async () => {
	const {calls, poll} = createHarness();

	assert.deepEqual(await poll('demoQueue'), []);
	assert.deepEqual(calls.getQueueUrl, [{QueueName: 'demoQueue', QueueOwnerAWSAccountId: undefined}]);
	assert.deepEqual(calls.receiveMessage, [{
		QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789012/demoQueue',
		MaxNumberOfMessages: 10,
		WaitTimeSeconds: 0
	}]);
});

test('treats undefined option values as omitted', async () => {
	const {calls, poll} = createHarness({messages: []});

	await poll('demoQueue', {timeout: undefined, numberOfMessages: undefined, json: undefined});

	assert.equal(calls.receiveMessage[0].WaitTimeSeconds, 0);
	assert.equal(calls.receiveMessage[0].MaxNumberOfMessages, 10);
});

test('forwards valid custom options to SQS', async () => {
	const {calls, poll} = createHarness({messages: ['message']});

	assert.deepEqual(await poll('demoQueue', {
		awsAccountId: '123456789012',
		numberOfMessages: 4,
		timeout: 20
	}), ['message']);
	assert.deepEqual(calls.getQueueUrl[0], {
		QueueName: 'demoQueue',
		QueueOwnerAWSAccountId: '123456789012'
	});
	assert.equal(calls.receiveMessage[0].MaxNumberOfMessages, 4);
	assert.equal(calls.receiveMessage[0].WaitTimeSeconds, 20);
});

test('rejects invalid SQS numeric ranges before calling AWS', async () => {
	const {calls, poll} = createHarness();

	for (const numberOfMessages of [0, 11, 1.5, Number.NaN]) {
		await assert.rejects(poll('demoQueue', {numberOfMessages}), {
			name: 'RangeError',
			message: '`numberOfMessages` must be an integer between 1 and 10'
		});
	}

	for (const timeout of [-1, 21, 1.5, Number.NaN]) {
		await assert.rejects(poll('demoQueue', {timeout}), {
			name: 'RangeError',
			message: '`timeout` must be an integer between 0 and 20'
		});
	}

	assert.equal(calls.getQueueUrl.length, 0);
});

test('rejects invalid option types before calling AWS', async () => {
	const {calls, poll} = createHarness();

	await assert.rejects(poll('demoQueue', {timeout: '1'}), {
		name: 'TypeError',
		message: 'Expected `timeout` to be of type `number`, got `string`'
	});
	await assert.rejects(poll('demoQueue', {numberOfMessages: '1'}), {
		name: 'TypeError',
		message: 'Expected `numberOfMessages` to be of type `number`, got `string`'
	});
	await assert.rejects(poll('demoQueue', {json: 'false'}), {
		name: 'TypeError',
		message: 'Expected `json` to be of type `boolean`, got `string`'
	});
	assert.equal(calls.getQueueUrl.length, 0);
});

test('reports a missing queue without calling receiveMessage', async () => {
	const {calls, poll} = createHarness({queueUrl: null});

	await assert.rejects(poll('missingQueue'), {
		name: 'TypeError',
		message: 'Queue `missingQueue` not found'
	});
	assert.equal(calls.receiveMessage.length, 0);
});

test('parses JSON bodies without failing the whole batch on invalid JSON', async () => {
	const messages = [
		{Body: '{"message":"hello"}', ReceiptHandle: 'first'},
		{Body: 'not-json', ReceiptHandle: 'second'}
	];
	const {poll} = createHarness({messages});

	assert.deepEqual(await poll('demoQueue', {json: true}), [
		{Body: {message: 'hello'}, ReceiptHandle: 'first'},
		{Body: 'not-json', ReceiptHandle: 'second'}
	]);
});

test('propagates AWS request errors', async () => {
	const lookupError = new Error('lookup failed');
	const receiveError = new Error('receive failed');

	await assert.rejects(createHarness({getQueueUrlError: lookupError}).poll('demoQueue'), lookupError);
	await assert.rejects(createHarness({receiveMessageError: receiveError}).poll('demoQueue'), receiveError);
});
