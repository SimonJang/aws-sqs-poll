interface Options {
	/**
	 * Duration in seconds for which the call waits for a message to arrive from the queue before returning
	 */
	timeout: number;
	/**
	 * Maximum number of messages to return. SQS might return fewer messages even if the maximum number is available
	 */
	numberOfMessages: number;
	/**
	 * AWS Account id
	 */
	awsAccountId?: string;
	/**
	 * Flag to indicate that the messages need to be returned a JSON and not as raw strings
	 */
	json?: boolean;
}

/**
 * Poll an SQS queue for messages
 *
 * @param queueName - Name of the queue
 * @param options - Polling options
 * @returns A array of messages
 */
declare function awsSQSPOll<T = unknown>(queueName: string, options?: Options): Promise<T>;

export = awsSQSPOll;
