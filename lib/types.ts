export type TypedArray =
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array;

/**
 * The status of the client
 */
export type Status = "connected" | "connecting" | "disconnected" | "error";
/**
 * The Quality of Service used to deliver the message.
 */
export type Qos = 0 | 1 | 2;

export type WithInvocationContext = {
	/**
	 * <code>invocationContext</code> as passed in with the corresponding field in the connectOptions or
	 * subscribeOptions.
	 */
	invocationContext: unknown;
};

export type MQTTError = {
	/** A number indicating the nature of the error. */
	errorCode: number;

	/** Text describing the error */
	errorMessage: string;
};

export type ErrorWithInvocationContext = MQTTError & WithInvocationContext;

/**
 * An application message, sent or received.
 */
export type Message = {
	destinationName: string;
	readonly duplicate: boolean;
	readonly payloadBytes: ArrayBuffer | TypedArray;
	readonly payloadString: string;
	qos: Qos;
	retained: boolean;
};

/**
 * A message from the broker
 * @eventProperty
 */
export type MessageEvent = CustomEvent<Message>;

/**
 * Client state change event
 * @eventProperty
 */
export type StatusEvent = CustomEvent<{
	type: Status;
	ctx: WithInvocationContext | null;
}>;

/**
 * Called when the connect acknowledgement has been received from the server.
 * @param o
 *  A single response object parameter is passed to the onSuccess callback containing the following fields:
 *  <li><code>invocationContext</code> as passed in with the corresponding field in the connectOptions.
 */
export type OnSuccessCallback = (o: WithInvocationContext) => void;

export type OnSubscribeSuccessParams = {
	grantedQos: Qos;
} & WithInvocationContext;

/**
 * Called when the subscribe acknowledgement has been received from the server.
 * @param o
 *  A single response object parameter is passed to the onSuccess callback containing the following fields:
 *  <li><code>invocationContext</code> as passed in with the corresponding field in the connectOptions.
 */
export type OnSubscribeSuccessCallback = (o: OnSubscribeSuccessParams) => void;

/**
 * Called when the connect request has failed or timed out.
 * @param e
 *  A single response object parameter is passed to the onFailure callback containing the following fields:
 *  <li><code>invocationContext</code> as passed in with the corresponding field in the connectOptions.
 *  <li><code>errorCode</code> a number indicating the nature of the error.
 *  <li><code>errorMessage</code> text describing the error.
 */
export type OnFailureCallback = (e: ErrorWithInvocationContext) => void;

export type UnsubscribeOptions = {
	/** passed to the onSuccess callback or onFailure callback.  */
	invocationContext?: unknown;
	/** called when the unsubscribe acknowledgement has been received from the server. */
	onSuccess?: OnSuccessCallback | undefined;
	/** called when the unsubscribe request has failed or timed out. */
	onFailure?: OnFailureCallback | undefined;
	/**
	 * timeout which, if present, determines the number of seconds after which the onFailure calback is called.
	 * The presence of a timeout does not prevent the onSuccess callback from being called when the unsubscribe
	 * completes.
	 */
	timeout?: number | undefined;
};
/**
 * Function for handling unsubscribing from a filter
 */
export type Unsubscribe = (options?: UnsubscribeOptions) => boolean;

/**
 * Function for handling a message for a subscription
 */
export type SubscriptionCallback = (evt: MessageEvent) => void;

/**
 * Used to control a subscription
 */
export type SubscribeOptions = {
	/** the maximum qos of any publications sent as a result of making this subscription. */
	qos?: Qos | undefined;
	/** passed to the onSuccess callback or onFailure callback. */
	invocationContext?: unknown;
	/** called when the subscribe acknowledgement has been received from the server. */
	onSuccess?: OnSubscribeSuccessCallback | undefined;
	/** called when the subscribe request has failed or timed out. */
	onFailure?: OnFailureCallback | undefined;
	/**
	 * timeout which, if present, determines the number of seconds after which the onFailure calback is called.
	 * The presence of a timeout does not prevent the onSuccess callback from being called when the subscribe
	 * completes.
	 */
	timeout?: number | undefined;
};

/**
 * Attributes used with a connection.
 */
export type ConnectionOptions = {
	/**
	 * If the connect has not succeeded within this number of seconds, it is deemed to have failed.
	 * @default The default is 30 seconds.
	 */
	timeout?: number | undefined;
	/** Authentication username for this connection. */
	userName?: string | undefined;
	/** Authentication password for this connection. */
	password?: string | undefined;
	/** Sent by the server when the client disconnects abnormally. */
	willMessage?: Message | undefined;
	/**
	 * The server disconnects this client if there is no activity for this number of seconds.
	 * @default The default value of 60 seconds is assumed if not set.
	 */
	keepAliveInterval?: number | undefined;
	/**
	 * If true(default) the client and server persistent state is deleted on successful connect.
	 * @default true
	 */
	cleanSession?: boolean | undefined;
	/** If present and true, use an SSL Websocket connection. */
	useSSL?: boolean | undefined;
	/** Passed to the onSuccess callback or onFailure callback. */
	invocationContext?: unknown;
	/**
	 * Called when the connect acknowledgement has been received from the server.
	 */
	onSuccess?: OnSuccessCallback | undefined;
	/**
	 * Specifies the mqtt version to use when connecting
	 * <dl>
	 *     <dt>3 - MQTT 3.1</dt>
	 *     <dt>4 - MQTT 3.1.1 (default)</dt>
	 *     <dt>5 - MQTT 5     (available with supporting client)</dt>
	 * </dl>
	 * @default 4
	 */
	mqttVersion?: 3 | 4 | 5 | undefined;
	/**
	 * If set to true, will force the connection to use the selected MQTT Version or will fail to connect.
	 */
	mqttVersionExplicit?: boolean | undefined;
	/**
	 * Called when the connect request has failed or timed out.
	 */
	onFailure?: OnFailureCallback | undefined;
	/**
	 * If present this contains either a set of hostnames or fully qualified
	 * WebSocket URIs (ws://example.com:1883/mqtt), that are tried in order in place of the host and port
	 * paramater on the construtor. The hosts are tried one at at time in order until one of then succeeds.
	 */
	hosts?: string[] | undefined;
	/**
	 * If present the set of ports matching the hosts. If hosts contains URIs, this property is not used.
	 */
	ports?: number[] | undefined;
	/**
	 * Sets whether the client will automatically attempt to reconnect
	 * to the server if the connection is lost.
	 */
	reconnect?: boolean | undefined;
	/**
	 * If present, should contain a list of fully qualified WebSocket
	 * uris (e.g. ws://mqtt.eclipseprojects.io:80/mqtt), that are tried
	 * in order in place of the host and port parameter of the
	 * construtor. The uris are tried one at a time in order until one
	 * of them succeeds. Do not use this in conjunction with hosts as
	 * the hosts array will be converted to uris and will overwrite this
	 * property.
	 */
	uris?: string[] | undefined;
};

/**
 * Required constructor for implementaions of IClient.
 * The structure of this is because of how the `paho-mqtt` library works.
 */
export type TConstruableClient<T extends IClient> = {
	new (
		borkerHost: string,
		borkerPort: number,
		borkerPath: string,
		id: string,
	): T;
	new (uri: string, id: string): T;
};

/**
 * Client interface
 */
export interface IClient {
	onConnectionLost(ev: MQTTError): void;
	onMessageArrived(ev: Message): void;
	connect(opt?: ConnectionOptions): void;
	isConnected(): boolean;
	subscribe(filter: string, subcribeOptions?: SubscribeOptions): void;
	unsubscribe(filter: string, unsubcribeOptions?: UnsubscribeOptions): void;
	startTrace(): void;
	stopTrace(): void;
	disconnect(): void;
	getTraceLog(): unknown[];
	send(
		topic: string,
		payload: string | ArrayBuffer,
		qos?: Qos,
		retained?: boolean,
	): void;
	readonly host: string;
	readonly port: number;
	readonly path: string;
	readonly clientId: string;
}
