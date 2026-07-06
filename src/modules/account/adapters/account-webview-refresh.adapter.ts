import type { AccountSessionRefreshResult } from "@/modules/account/account-type";

type SessionRefreshRequest = {
	sourceUri: string;
};

type SessionRefreshWebViewAdapter = (
	request: SessionRefreshRequest,
) => Promise<AccountSessionRefreshResult>;

const ADAPTER_WAIT_MS = 2000;

let adapter: SessionRefreshWebViewAdapter | null = null;
let adapterWaiters: ((adapter: SessionRefreshWebViewAdapter | null) => void)[] =
	[];

export function registerWebViewRefreshAdapter(
	nextAdapter: SessionRefreshWebViewAdapter,
) {
	adapter = nextAdapter;
	const waiters = adapterWaiters;
	adapterWaiters = [];
	waiters.forEach((resolve) => {
		resolve(nextAdapter);
	});
	return () => {
		if (adapter === nextAdapter) {
			adapter = null;
		}
	};
}

export async function waitForWebViewRefreshAdapter(): Promise<SessionRefreshWebViewAdapter> {
	if (adapter) {
		return adapter;
	}

	const nextAdapter = await new Promise<SessionRefreshWebViewAdapter | null>(
		(resolve) => {
			const timeout = setTimeout(() => {
				adapterWaiters = adapterWaiters.filter((waiter) => waiter !== resolve);
				resolve(null);
			}, ADAPTER_WAIT_MS);
			adapterWaiters.push((value) => {
				clearTimeout(timeout);
				resolve(value);
			});
		},
	);

	if (!nextAdapter) {
		throw new Error(
			"Riot session refresh WebView did not register within 2 seconds.",
		);
	}

	return nextAdapter;
}
