export const ACCOUNT_RIOT_LOGIN_URL =
  'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid';

export const ACCOUNT_RIOT_INTERACTIVE_LOGIN_HOST = 'authenticate.riotgames.com';

export const ACCOUNT_RIOT_INTERACTIVE_LOGIN_PATH = '/login';

export const ACCOUNT_RIOT_AUTH_COOKIE_URLS = [
  'https://auth.riotgames.com',
  'https://authenticate.riotgames.com',
  'https://riotgames.com',
] as const;

export const ACCOUNT_RIOT_AUTH_DOMAINS = [
  'auth.riotgames.com',
  'authenticate.riotgames.com',
  'riotgames.com',
  '.riotgames.com',
] as const;

export const ACCOUNT_TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

export const ACCOUNT_RIOT_CLIENT_PLATFORM =
  'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9';

export const ACCOUNT_FALLBACK_CLIENT_VERSION = '43.0.1.4195386.4190634';
