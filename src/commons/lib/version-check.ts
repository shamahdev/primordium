const LATEST_RELEASE_URL =
	"https://api.github.com/repos/shamahdev/primordium/releases/latest";

interface LatestRelease {
	version: string;
	html_url: string;
}

export async function fetchLatestVersion(): Promise<LatestRelease | null> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);

	try {
		const response = await fetch(LATEST_RELEASE_URL, {
			headers: { Accept: "application/vnd.github.v3+json" },
			signal: controller.signal,
		});

		if (!response.ok) return null;

		const data = (await response.json()) as {
			tag_name: string;
			html_url: string;
		};
		const version = data.tag_name.replace(/^v/, "");

		return { version, html_url: data.html_url };
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

export function isNewerVersion(current: string, latest: string): boolean {
	const currentParts = current.split(".").map(Number);
	const latestParts = latest.split(".").map(Number);

	for (let i = 0; i < 3; i++) {
		const c = currentParts[i] ?? 0;
		const l = latestParts[i] ?? 0;
		if (l > c) return true;
		if (l < c) return false;
	}

	return false;
}
