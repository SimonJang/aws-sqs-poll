import test from 'ava';
import sinon from 'sinon';
// Import sqs from './test/fixtures/fake-sqs';
import m from './';

const sandbox = sinon.sandbox.create();

test.before(() => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: '123456789111'});
});

test.after(() => {
	sandbox.restore();
});

test('error no queue name', t => {
	t.throws(m(), 'Expected `queueName` to be of type `string`, got `undefined`');
});

test('invalid queue name test', t => {
	t.throws(m('l[7777&&]l'), 'Invalid queue name');
});

test('invalid queueOwnerId test', t => {
	sandbox.stub(process, 'env', {AWS_ACCOUNT_ID: '123'});
	t.throws(m('demoQueue'), 'Invalid AWS Account Id');
});

test('invalid queue not found test', async t => {
	t.throws(m('trolololo', {awsAccountId: '123456789111'}), 'Queue not found');
});
