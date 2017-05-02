import test from 'ava';
import './fixtures/fake-sqs';		// eslint-disable-line import/no-unassigned-import
import m from '../';

test('error no queue name', async t => {
	await t.throws(m(), 'Expected `queueName` to be of type `string`, got `undefined`');
});

test('invalid queue name test', async t => {
	await t.throws(m('l[7777&&]l'), 'Invalid queue name');
});

test('invalid queueOwnerId test', async t => {
	await t.throws(m('demoQueue', {awsAccountId: '1vavaf2'}), 'Invalid AWS Account Id');
});

test('invalid queue not found test', async t => {
	await t.throws(m('trolololo', {awsAccountId: '123456789111'}), 'Queue `trolololo` not found');
});

test('returns messages and promise', async t => {
	const result = await m('demoQueue', {awsAccountId: '123456789111'});
	const messages = {Messages: ['message1', 'message2', 'message3']};
	t.deepEqual(result, messages.Messages);
});

test('Testing json argument', async t => {
	const result = await m('jsonQueue', {json: true});
	t.deepEqual(result, [ { Body: { messages: ['message1', 'message2', 'message3'], description: 'someArray' }, ReceiptHandle: '1234556789' } ]);
})

test('Testing json argument with multiple argument', async t => {
	const result = await m('mjsonQueue', {json: true});
	console.log(result);
	t.deepEqual(result, [ { Body: { messages: ['message1', 'message2', 'message3'], description: 'someArray' }, ReceiptHandle: '1234556789' },
	{ Body: { messages: ['message1', 'message2', 'message3'], description: 'someArray' }, ReceiptHandle: '1233556789' }]);
})
