const TAG_PAD = 24;

function stamp() {
	return new Date().toISOString().slice(11, 23);
}

function fmt(tag: string, level: string, message: string, data?: unknown) {
	const prefix = `[${stamp()}] ${level} ${tag.padEnd(TAG_PAD)}`;
	if (data !== undefined) {
		return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
	}
	return `${prefix} ${message}`;
}

function createLogger(tag: string) {
	return {
		debug(message: string, data?: unknown) {
			if (__DEV__) {
				console.log(fmt(tag, "DEBUG", message, data));
			}
		},
		info(message: string, data?: unknown) {
			console.log(fmt(tag, "INFO ", message, data));
		},
		warn(message: string, data?: unknown) {
			console.warn(fmt(tag, "WARN ", message, data));
		},
		error(message: string, data?: unknown) {
			console.error(fmt(tag, "ERROR", message, data));
		},
	};
}

export const log = {
	store: createLogger("store"),
	auth: createLogger("auth"),
	api: createLogger("api"),
	nav: createLogger("nav"),
};
