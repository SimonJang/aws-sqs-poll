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

awsSqsPoll('QueueName', 'UserAWSAccountID')
    // { Messages: [messages] }
```

## API

### aws-sqs-poll(queueName, AWSAccountID)

#### queueName

Type: `string`

#### AWSAccountID

Type: `string`


## License

MIT © [Simon](https://github.com/SimonJang)
