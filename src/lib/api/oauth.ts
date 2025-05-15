import crypto from 'crypto';

interface OAuthParams {
  oauth_token: string;
  oauth_token_secret: string;
  body?: Record<string, any>;
  [key: string]: any;
}

interface OAuthHeaderParams {
  oauth_consumer_key: string;
  oauth_nonce: string;
  oauth_signature_method: string;
  oauth_timestamp: string;
  oauth_version: string;
  oauth_token: string;
  oauth_signature?: string;
  [key: string]: string | undefined;
}

/**
 * Generates an OAuth 1.0a authorization header
 */
export function generateOAuth1Header(
  method: string,
  url: string,
  params: OAuthParams
): string {
  const oauthParams: OAuthHeaderParams = {
    oauth_consumer_key: process.env.TWITTER_CLIENT_ID!,
    oauth_nonce: crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
    oauth_token: params.oauth_token,
  };

  // Create signature base parameters
  const signatureParams = new Map<string, string>();
  
  // Add OAuth params
  Object.entries(oauthParams).forEach(([key, value]) => {
    if (value && key !== 'oauth_signature') {
      signatureParams.set(key, value);
    }
  });

  // For POST requests with JSON body, add body parameters
  if (method.toUpperCase() === 'POST' && params.body) {
    const bodyParams = flattenObject(params.body);
    Object.entries(bodyParams).forEach(([key, value]) => {
      if (typeof value !== 'undefined' && value !== null) {
        signatureParams.set(key, value);
      }
    });
  }

  // Create signature base string
  const baseParams = Array.from(signatureParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(baseParams)
  ].join('&');

  // Create signing key
  const signingKey = [
    encodeURIComponent(process.env.TWITTER_CLIENT_SECRET!),
    encodeURIComponent(params.oauth_token_secret)
  ].join('&');

  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64');

  oauthParams.oauth_signature = signature;

  // Create authorization header
  return 'OAuth ' + Object.entries(oauthParams)
    .filter(([_, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}="${encodeURIComponent(value!)}"`)
    .join(', ');
}

/**
 * Flattens a nested object into a single level object with dot notation keys
 */
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, key: string) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (
      typeof obj[key] === 'object' && 
      obj[key] !== null && 
      !Array.isArray(obj[key]) &&
      !(obj[key] instanceof Blob)
    ) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else if (obj[key] !== undefined && obj[key] !== null) {
      acc[pre + key] = String(obj[key]);
    }
    return acc;
  }, {});
} 