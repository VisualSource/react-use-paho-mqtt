import { useContext } from "react";
import { mqttContext } from "./mqttContext";

/**
 * React hook for accessing mqtt client
 * @returns
 */
export const useMqtt = () => {
	const ctx = useContext(mqttContext);
	if (!ctx)
		throw new Error("useMqtt is required to be wrapped in a mqtt provider");
	return ctx;
};
