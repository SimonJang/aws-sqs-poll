import test from 'ava';
import sinon from 'sinon';

import sqs from './fixtures/fake-sqs';
import lib from './';

const sandbox = sinon.sandbox.create();

test.before(() => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: '123456789111'});
	const stubGetQueue = sandbox.stub(sqs, 'getQueueUrl');
	stubGetQueue.withArgs({QueueName: 'demoQueue', QueueOwnerAWSAccountId: '123456789111'}).yields(undefined, {QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue'});
	stubGetQueue.withArgs({QueueName: 'unknownQueue', QueueOwnerAWSAccountId: '123456789111'}).yields(undefined, {QueueUrl: ''});
	const stubSendMessage = sandbox.stub(sqs, 'receiveMessage');
	stubSendMessage.withArgs({QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/12345678912/somequeue', MaxNumberOfMessages: 10})
					.yields(undefined, {Messages: ['message1', 'message2', 'message3']});
});

test.after(() => {
	sandbox.restore();
});

test('error no queue name', async t => {
	t.throws(lib(), 'Please provide a queue name');
});

test('invalid queue name test', async t => {
	t.throws(lib('l[7777&&]l'), 'Invalid queue name');
});

test('invalid queue not found test', t => {
	t.throws(lib('unknownQueue'), 'Queue not found');
});

test('checking messages reponse', async t => {
	const response = await lib('demoQueue');
	const parsedArray = JSON.stringify(['message1', 'message2', 'message3']);
	t.true(response.Messages.length !== 0);
	t.is(JSON.stringify(response.Messages), parsedArray);
});

test('checking message response is promise', async t => {
	const response = lib('demoQueue');
	t.true(response instanceof Promise);
});

test('invalid queueOwnerId test', async t => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: '123'});
	t.throws(lib('demoQueue'), 'Invalid queueOwnerId');
});