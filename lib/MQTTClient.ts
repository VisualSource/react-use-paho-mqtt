import MQTT from "paho-mqtt";

/**
 * @interface
 * Options for the connection to broker.
 */
export interface MQTTClientOptions extends MQTT.ConnectionOptions {
	/**
	 * The Messaging client identifier, between 1 and 23 characters in length.
	 * @default "mqtt-websocket-client"
	 */
	clientId?: string;
	/**
	 * the address of the messaging server as a DNS name or dotted decimal IP address.
	 * @default "localhost"
	 */
	host?: string;
	/**
	 * The port number to connect to
	 * @default 9001
	 */
	port?: number;
	/**
	 * the path on the host to connect to - only used if host is not a URI.
	 * @default "/mqtt"
	 */
	path?: string;
	/**
	 * The address of the messaging server as a fully qualified WebSocket URI
	 */
	hostUri?: string;
}

/**
 * The status of the client
 */
export type Status = "connected" | "connecting" | "disconnected" | "error";
/**
 * A message from the broker
 * @eventProperty
 */
export type MessageEvent = CustomEvent<MQTT.Message>;

/**
 * Client state change event
 * @eventProperty
 */
export type StatusEvent = CustomEvent<{
	type: Status;
	ctx: MQTT.WithInvocationContext | null;
}>;
/**
 * Function for handling unsubscribing from a filter
 */
export type Unsubscribe = (options?: MQTT.UnsubscribeOptions) => boolean;
/**
 * Function for handling a message for a subscription
 */
export type SubscriptionCallback = (evt: MessageEvent) => void;

const SEPARATOR = "/";
const SINGLE = "+";
const ALL = "#";

export class MQTTClient extends EventTarget {
	/**
	 * Error Event
	 *
	 * @event
	 * @example client.addEventListener("error",(ev)=>{})
	 */
	public static EVENT_ERROR = "error";
	/**
	 * State Event
	 *
	 * @event
	 * @example client.addEventListener("state",(ev)=>{})
	 *
	 *  Emited when the client changes state.
	 */
	public static EVENT_STATE = "state";

	/**
	 * Filter Event
	 * @event
	 * @example client.addEventListener("filter:/topic/example",(ev)=>{})
	 *
	 * Emited when a message from the broker is received.
	 */
	public static EVENT_FILTER = "filter";

	#mountCount = 0;
	private topics_with_wilds: Map<string, number> = new Map();
	private topics: Map<string, number> = new Map();
	private status: Status = "disconnected";
	private client: MQTT.Client;
	private isConnecting = false;
	private connectionOptions;
	constructor({
		host = "localhost",
		port = 9001,
		path = "/mqtt",
		clientId = "mqtt-websocket-client",
		hostUri,
		...options
	}: MQTTClientOptions) {
		super();
		this.connectionOptions = options;
		this.client = hostUri
			? new MQTT.Client(hostUri, clientId)
			: new MQTT.Client(host, port, path, clientId);
		this.client.onConnectionLost = () => {
			this.isConnecting = false;
			this.setState("disconnected", null);
		};
		this.client.onMessageArrived = (ev) => {
			if (this.topics.has(ev.destinationName)) {
				return this.emit(
					`${MQTTClient.EVENT_FILTER}:${ev.destinationName}`,
					ev,
				);
			}

			for (const key of this.topics_with_wilds.keys()) {
				if (this.matches(key, ev.destinationName)) {
					this.emit(`${MQTTClient.EVENT_FILTER}:${key}`, ev);
				}
			}
		};
	}
	/**
	 * Match a wild topic string with a topic
	 *
	 * @see https://www.npmjs.com/package/mqtt-pattern
	 * @param pattern
	 * @param topic
	 * @returns {boolean}
	 */
	private matches(pattern: string, topic: string): boolean {
		const patternSegments = pattern.split(SEPARATOR);
		const topicSegments = topic.split(SEPARATOR);

		const patternLength = patternSegments.length;
		const topicLength = topicSegments.length;
		const lastIndex = patternLength - 1;

		for (let i = 0; i < patternLength; i++) {
			const currentPattern = patternSegments[i];
			const patternChar = currentPattern[0];
			const currentTopic = topicSegments[i];

			if (!currentTopic && !currentPattern) continue;

			if (!currentTopic && currentPattern !== ALL) return false;

			// Only allow # at end
			if (patternChar === ALL) return i === lastIndex;
			if (patternChar !== SINGLE && currentPattern !== currentTopic)
				return false;
		}

		return patternLength === topicLength;
	}

	private setState(type: Status, ctx: MQTT.WithInvocationContext | null) {
		this.status = type;
		this.emit(MQTTClient.EVENT_STATE, { type, ctx });
	}

	private addTopic(topic: string): void {
		// check for '#' and '+' filters
		if (topic.endsWith(ALL) || topic.search(/\/\+\//) !== -1) {
			const item = this.topics_with_wilds.get(topic);
			this.topics_with_wilds.set(topic, item ? item + 1 : 1);
			return;
		}

		const item = this.topics.get(topic);
		this.topics.set(topic, item ? item + 1 : 1);
	}

	private removeTopic(topic: string) {
		if (topic.endsWith(ALL) || topic.search(/\/\+\//) !== -1) {
			const item = this.topics_with_wilds.get(topic);
			if (!item) return;
			if (item <= 1) {
				this.topics_with_wilds.delete(topic);
				return;
			}
			this.topics_with_wilds.set(topic, item - 1);
			return;
		}

		const item = this.topics.get(topic);
		if (!item) return;
		if (item <= 1) {
			this.topics.delete(topic);
			return;
		}
		this.topics.set(topic, item - 1);
	}

	/**
	 * Wrapper around `dispatchEvent` for sending custom events
	 * @param event
	 * @param payload
	 */
	private emit(event: string, payload: unknown): void {
		this.dispatchEvent(new CustomEvent(event, { detail: payload }));
	}

	/**
	 * On mount start connecting.
	 * Can be used within a useEffect to init a connection to the broker without
	 * trying to connect a seconed time in dev mode for react.
	 *
	 * @return {*}
	 */
	public mount(): void {
		this.#mountCount++;
		if (this.#mountCount !== 1) return;

		this.connect(this.connectionOptions);
	}

	/**
	 * On unmount disconnect client
	 */
	public unmount(): void {
		this.#mountCount--;
		if (this.#mountCount !== 0) return;
		this.disconnect();
	}

	/**
	 * Get the status of mqtt client
	 *
	 * @return {Status}  {Status}
	 */
	public getStatus(): Status {
		return this.status;
	}

	/**
	 * Normal disconnect of this Messaging client from its server.
	 *
	 * @return {void}
	 */
	public disconnect(): void {
		if (!this.client.isConnected() || this.isConnecting) return;
		this.setState("disconnected", null);
		this.client.disconnect();
	}

	/**
	 * Start connecting to the borker.
	 *
	 * @param {Paho.MQTT.ConnectionOptions} [options={}]
	 * @return {void}
	 */
	public connect(options: MQTT.ConnectionOptions = {}): void {
		if (this.client.isConnected() || this.isConnecting) return;
		this.isConnecting = true;
		this.setState("connecting", null);
		this.client.connect({
			...options,
			onFailure: (ev) => {
				this.setState("error", ev);
				this.emit("error", new Error("Failed to connect"));
				options.onFailure?.call(this, ev);
			},
			onSuccess: (ev) => {
				this.isConnecting = false;
				this.setState("connected", ev);
				options.onSuccess?.call(this, ev);
			},
		});
	}

	/**
	 * Send a message to the consumers of the destination in the Message.
	 *
	 * @param {string} topic The name of the destination to which the message is to be sent.
	 * @param {(string | ArrayBuffer)} payload The message payload to be sent.
	 * @param {Paho.MQTT.Qos} [qos=0] The Quality of Service used to deliver the message.
	 * @param {boolean} [retained=false] If true, the message is to be retained by the server and delivered to both current and future subscriptions. If false the server only delivers the message to current subscribers, this is the default for new Messages. A received message has the retained boolean set to true if the message was published with the retained boolean set to true and the subscrption was made after the message has been published.
	 * @return {boolean}  If the message was sent
	 */
	public publish(
		topic: string,
		payload: string | ArrayBuffer,
		qos: MQTT.Qos = 0,
		retained = false,
	): boolean {
		if (this.client.isConnected()) {
			this.client.send(topic, payload, qos, retained);
			return true;
		}
		return false;
	}

	/**
	 * Subscribe for messages, request receipt of a copy of messages sent to the destinations described by the filter.
	 *
	 * @param {string} topic A filter describing the destinations to receive messages from.
	 * @param {SubscrptionCallback} callback Function for handling reveived messages
	 * @return {Unsubscribe} Function to unsubscribe from messages, stop receiving messages sent to destinations described by the filter.
	 */

	/**
	 * Subscribe for messages, request receipt of a copy of messages sent to the destinations described by the filter.
	 *
	 * @param {string} topic A filter describing the destinations to receive messages from.
	 * @param {SubscrptionCallback} callback Function for handling reveived messages
	 * @param {Paho.MQTT.SubscribeOptions} [options] options for
	 * @return {Unsubscribe} Function to unsubscribe from messages, stop receiving messages sent to destinations described by the filter.
	 */
	public subscribe(
		topic: string,
		callback: SubscriptionCallback,
		options?: MQTT.SubscribeOptions,
	): Unsubscribe {
		// Have to type callback as EventListener because addVentListener only likes Event and not CustomEvent
		this.addEventListener(
			`${MQTTClient.EVENT_FILTER}:${topic}`,
			callback as EventListener,
		);
		this.addTopic(topic);
		this.client.subscribe(topic, {
			...options,
			onFailure: (ctx) => {
				this.removeEventListener(
					`${MQTTClient.EVENT_FILTER}:${topic}`,
					callback as EventListener,
				);
				this.removeTopic(topic);
				options?.onFailure?.call(this, ctx);
				this.emit(MQTTClient.EVENT_ERROR, new Error("Failed to subscribe"));
			},
		});

		return (options?: MQTT.UnsubscribeOptions) => {
			if (!this.client.isConnected()) {
				options?.onFailure?.call(this, options?.invocationContext);
				return false;
			}
			this.removeEventListener(
				`${MQTTClient.EVENT_FILTER}:${topic}`,
				callback as EventListener,
			);
			this.removeTopic(topic);
			this.client.unsubscribe(topic, options);
			return true;
		};
	}

	public isSubscribed(topic: string): boolean {
		return this.topics.has(topic) || this.topics_with_wilds.has(topic);
	}

	/**
	 * The server's DNS hostname or dotted decimal IP address.
	 *
	 * @readonly
	 */
	public get host() {
		return this.client.host;
	}
	/**
	 * The server's port.
	 *
	 * @readonly
	 */
	public get port() {
		return this.client.port;
	}
	/**
	 * The server's path.
	 *
	 * @readonly
	 */
	public get path() {
		return this.client.path;
	}
	/**
	 * The client id used when connecting to the server.
	 *
	 * @readonly
	 */
	public get clientId() {
		return this.client.clientId;
	}

	/**
	 * Start tracing.
	 *
	 * @return {void} {void}
	 */
	public startTrace(): void {
		return this.client.startTrace();
	}
	/**
	 * Stop tracing.
	 * @return {void} {void}
	 */
	public stopTrace(): void {
		this.client.stopTrace();
	}
	/**
	 * Get the contents of the trace log.
	 *
	 * @return {unknown[]} tracebuffer containing the time ordered trace records.
	 */
	public getTraceLog(): unknown[] {
		return this.client.getTraceLog();
	}
}
