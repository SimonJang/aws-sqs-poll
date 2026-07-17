# aws-sqs-poll ![CI](https://github.com/SimonJang/aws-sqs-poll/actions/workflows/ci.yml/badge.svg)

> Poll messages from an AWS SQS queue.

The package supports SQS long polling when `timeout` is greater than zero. Long polling reduces empty responses and can lower polling cost; see the [AWS SQS long-polling guide](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-long-polling.html).

## Install

```sh
npm install aws-sqs-poll aws-sdk
```

`aws-sdk` v2 is a peer dependency so the package uses the credentials and configuration from your application.

## Usage

```js
const poll = require('aws-sqs-poll');

const messages = await poll('orders', {
	awsAccountId: '123456789012',
	numberOfMessages: 5,
	timeout: 20,
	json: true
});
```

## API

### poll(queueName, options?)

Returns a promise for the received messages, or an empty array when no messages are available.

#### queueName

Type: `string`

An SQS standard or FIFO queue name. Standard names may contain alphanumeric characters, hyphens, and underscores. FIFO names end in `.fifo`. The full name may contain at most 80 characters.

#### options

Type: `object`

##### numberOfMessages

Type: `number`

Default: `10`

Maximum number of messages requested in one poll. Must be an integer from 1 through 10. SQS may return fewer messages.

##### timeout

Type: `number`

Default: `0`

Polling wait time in seconds. `0` uses short polling; values from 1 through 20 enable long polling.

##### awsAccountId

Type: `string`

Twelve-digit AWS account ID of the account that owns the queue.

##### json

Type: `boolean`

Default: `false`

Parse each valid JSON message body. Bodies that are not valid JSON remain unchanged.

## License

MIT © [Simon Jang](https://github.com/SimonJang)
