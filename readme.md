# aws-sqs-poll [![Build Status](https://travis-ci.org/SimonJang/aws-sqs-poll.svg?branch=master)](https://travis-ci.org/SimonJang/aws-sqs-poll)

> Polling messages from AWS SQS

## Note on long polling

Long polling helps reduce your cost of using Amazon SQS by reducing the number of empty responses (when there are no messages available to return in reply to a ReceiveMessage request sent to an Amazon SQS queue) and eliminating false empty responses (when messages are available in the queue but aren't included in the response):

See [here](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-long-polling.html) for more information.


## Install

```
$ npm install --save aws-sqs-poll
```


## Usage

```js
const awsSqsPoll = require('aws-sqs-poll');

awsSqsPoll('QueueName')
    //  ["MessageId": "28f61fd2-b9ca-4cb9-879a-71ea8bce4636",
    //   "ReceiptHandle": "AQEB9mnsxtAZlwnDERxn3yADAP96QRe0KPbqaKXLvvchqmD4jAr",
    //   "MD5OfBody": "098f6bcd4621d373cade4e832627b4f6",
    //   "Body": "test"]


awsSqsPoll('QueueName', {AwsAccountId: '123456789012', numberOfMessages: 1, timeout: 20, json: false})
    //  ["MessageId": "28f61fd2-b9ca-4cb9-879a-71ea8bce4636",
    //   "ReceiptHandle": "AQEB9mnsxtAZlwnDERxn3yADAP96QRe0KPbqaKXLvvchqmD4jAr",
    //   "MD5OfBody": "098f6bcd4621d373cade4e832627b4f6",
    //   "Body": "test"]
```

## API

### aws-sqs-poll(queueName, [options])

#### queueName

Type: `string`

#### options

Type: `object`


##### options.awsAccountId

Type: `string`

AWS account ID of the account that created the queue.


##### options.numberOfMessages

Type: `number`

Number of messages to be retrieved in 1 polling action. When polling a queue with few messages (< 1000 messages), you will get less messages then the numberOfMessages parameter.


##### options.timeout

Type: `number`

Timeout (polling time) to listen to the queue for new messages.


##### options.json

Type: `boolean`

Flag for converting the data back to JSON format

## License

MIT © [Simon Jang](https://github.com/SimonJang)
