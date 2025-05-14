import crypto from 'crypto';

interface OAuthParams {
  oauth_token: string;
  oauth_token_secret: string;
  [key: string]: string;
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
    oauth_nonce: crypto.randomBytes(32).toString('base64'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
    oauth_token: params.oauth_token,
  };

  // Create signature
  const signatureParams = {
    ...oauthParams,
    ...params,
  };

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(
      Object.keys(signatureParams)
        .sort()
        .map(key => `${key}=${encodeURIComponent(signatureParams[key] as string)}`)
        .join('&')
    ),
  ].join('&');

  const signingKey = [
    encodeURIComponent(process.env.TWITTER_CLIENT_SECRET!),
    encodeURIComponent(params.oauth_token_secret),
  ].join('&');

  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64');

  oauthParams.oauth_signature = signature;

  // Create authorization header
  return (
    'OAuth ' +
    Object.keys(oauthParams)
      .sort()
      .map(key => {
        const value = oauthParams[key];
        return value ? `${key}="${encodeURIComponent(value)}"` : '';
      })
      .filter(Boolean)
      .join(', ')
  );
} 