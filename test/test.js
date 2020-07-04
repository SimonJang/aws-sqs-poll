const test = require('ava');
require('./fixtures/fake-sqs');		// eslint-disable-line import/no-unassigned-import
const m = require('..');

test('should fail when no queue name is provided', async t => {
	await t.throwsAsync(m(), null, 'Expected `queueName` to be of type `string`, got `undefined`');
});

test('should fail on invalid queue name', async t => {
	await t.throwsAsync(m('l[7777&&]l'), null, 'Invalid queue name');
});

test('should fail on invalid queueOwnerId test', async t => {
	await t.throwsAsync(m('demoQueue', {awsAccountId: '1vavaf2'}), null, 'Invalid AWS Account Id');
});

test('should fail when no queue is found', async t => {
	await t.throwsAsync(m('trolololo', {awsAccountId: '123456789111'}), null, 'Queue `trolololo` not found');
});

test('should return messages with only the queuename', async t => {
	const result = await m('demoQueue');

	t.deepEqual(result, ['message1', 'message2', 'message3']);
});

test('should return messages', async t => {
	const result = await m('demoQueue', {awsAccountId: '123456789111'});

	t.deepEqual(result, ['message1', 'message2', 'message3']);
});

test('should parse messages when `json:true` is provided', async t => {
	const result = await m('jsonQueue', {json: true});

	t.deepEqual(result, [
		{
			Body: {
				messages: ['message1', 'message2', 'message3'],
				description: 'someArray'
			},
			ReceiptHandle: '1234556789'
		}
	]);
});

test('should parse messages when `json:true` is provided with multiple arguments', async t => {
	const result = await m('mjsonQueue', {json: true});

	t.deepEqual(result, [
		{
			Body: {
				messages: ['message1', 'message2', 'message3'],
				description: 'someArray'
			},
			ReceiptHandle: '1234556789'
		},
		{
			Body: {
				messages: ['message1', 'message2', 'message3'],
				description: 'someArray'
			},
			ReceiptHandle: '1233556789'
		}
	]);
});
