declare namespace awsSQSPoll {
	interface Options {
		/**
		 * Duration in seconds for which the call waits for a message to arrive.
		 * Must be an integer between 0 and 20. Defaults to 0.
		 */
		timeout?: number;

		/**
		 * Maximum number of messages to return.
		 * Must be an integer between 1 and 10. Defaults to 10.
		 */
		numberOfMessages?: number;

		/** AWS account ID of the account that owns the queue. */
		awsAccountId?: string;

		/** Parse each valid JSON message body. Defaults to false. */
		json?: boolean;
	}
}

/**
 * Poll an SQS queue for messages.
 *
 * @param queueName - Name of the queue.
 * @param options - Polling options.
 * @returns An array of messages, or an empty array when no messages are available.
 */
declare function awsSQSPoll<T = unknown[]>(queueName: string, options?: awsSQSPoll.Options): Promise<T>;

export = awsSQSPoll;
