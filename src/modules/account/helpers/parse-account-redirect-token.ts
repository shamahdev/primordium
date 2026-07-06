export function parseAccountRedirectToken(uri: string) {
	const match = uri.match(/access_token=([^&#]+)/);
	if (!match) {
		throw new Error("Could not read Riot access token from redirect.");
	}
	return decodeURIComponent(match[1]);
}
