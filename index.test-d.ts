import {expectType} from 'tsd';
import awsSQSPoll = require('.');

expectType<Promise<unknown[]>>(
	awsSQSPoll('somequeue', {awsAccountId: '12324412132', json: true, numberOfMessages: 10, timeout: 10})
);

expectType<Promise<unknown[]>>(
	awsSQSPoll('somequeue', {awsAccountId: '12324412132', numberOfMessages: 10, timeout: 10})
);

expectType<Promise<unknown[]>>(
	awsSQSPoll('somequeue', {json: true, numberOfMessages: 10, timeout: 10})
);

expectType<Promise<unknown[]>>(
	awsSQSPoll('somequeue', {numberOfMessages: 10, timeout: 10})
);

expectType<Promise<unknown[]>>(
	awsSQSPoll('somequeue')
);
