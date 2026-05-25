export const RIOT_LOGIN_URL =
  'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid';

export const RIOT_INTERACTIVE_LOGIN_HOST = 'authenticate.riotgames.com';

export const RIOT_INTERACTIVE_LOGIN_PATH = '/login';

export const RIOT_AUTH_COOKIE_URLS = [
  'https://auth.riotgames.com',
  'https://authenticate.riotgames.com',
  'https://riotgames.com',
] as const;

export const RIOT_AUTH_DOMAINS = ['auth.riotgames.com', 'authenticate.riotgames.com', 'riotgames.com', '.riotgames.com'] as const;
