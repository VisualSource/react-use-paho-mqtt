import { useEffect } from "react";
import type { MQTTClient } from "./MQTTClient";
import { mqttContext } from "./mqttContext";

/**
 *
 * @param param0
 * @returns
 */
export function MqttProvider({
	children,
	client,
}: React.PropsWithChildren<{ client: MQTTClient }>) {
	useEffect(() => {
		client.mount();
		return () => {
			client.unmount();
		};
	}, [client]);

	return <mqttContext.Provider value={client}>{children}</mqttContext.Provider>;
}
