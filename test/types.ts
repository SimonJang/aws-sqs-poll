import poll = require('..');

interface Message {
	Body?: string;
	ReceiptHandle?: string;
}

const defaultResult: Promise<unknown[]> = poll('queue');
// The explicit generic remains the complete result type for compatibility with 1.2.0.
const customResult: Promise<Message[]> = poll<Message[]>('queue', {
	awsAccountId: '123456789012',
	json: false,
	numberOfMessages: 4,
	timeout: 20
});

poll('queue', {timeout: 10});
poll('queue', {numberOfMessages: 2});
poll('queue', {json: true});
poll('queue', {awsAccountId: '123456789012'});
poll('queue', {timeout: undefined, numberOfMessages: undefined, json: undefined});

// @ts-expect-error queueName must be a string
poll(123);
// @ts-expect-error timeout must be a number
poll('queue', {timeout: '10'});
// @ts-expect-error numberOfMessages must be a number
poll('queue', {numberOfMessages: '2'});
// @ts-expect-error json must be a boolean
poll('queue', {json: 'yes'});

void defaultResult;
void customResult;
