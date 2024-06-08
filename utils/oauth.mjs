import http from 'http';
import https from 'https';
import url from 'url';
import { config } from '../config.mjs'; // Ensure the correct path to your config file
import { writeFileSync } from 'fs';
import { exec } from 'child_process';
import crypto from 'crypto';

// Generate a secure random state value
const state = crypto.randomBytes(16).toString('hex');

// Construct the authorization URL with proper URL encoding
const authorizationUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${
  config.clientId
}&scope=${encodeURIComponent(
  'read:confluence-content.all read:confluence-user read:confluence-groups write:confluence-groups write:confluence-space write:confluence-content write:confluence-props'
)}&redirect_uri=${encodeURIComponent(
  config.redirectUri
)}&state=${state}&response_type=code&prompt=consent`;

console.log(`Authorization URL: ${authorizationUrl}`);

const handleAuthCallback = (reqUrl, res) => {
  const { code } = reqUrl.query;
  console.log(`Received authorization code: ${code}`);

  // Exchange authorization code for access token
  const postData = JSON.stringify({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
  });

  const options = {
    hostname: 'auth.atlassian.com',
    path: '/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  const tokenReq = https.request(options, (tokenRes) => {
    let tokenData = '';

    tokenRes.on('data', (chunk) => {
      tokenData += chunk;
    });

    tokenRes.on('end', () => {
      if (tokenRes.statusCode >= 200 && tokenRes.statusCode < 300) {
        try {
          const tokenResponse = JSON.parse(tokenData);
          const accessToken = tokenResponse.access_token;
          const expiresIn = tokenResponse.expires_in; // Expiration time in seconds

          // Calculate the expiration time in milliseconds
          const tokenExpirationTime = Date.now() + expiresIn * 1000;

          // Save the access token and expiration time in config.mjs
          config.accessToken = accessToken;
          config.tokenExpirationTime = tokenExpirationTime;
          writeFileSync(
            './config.mjs',
            `export const config = ${JSON.stringify(config, null, 2)};`
          );
          console.log('Access Token:', accessToken);

          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('OAuth flow completed. You can now close this window.');
        } catch (error) {
          console.error('Failed to parse JSON response:', error.message);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to parse JSON response.');
        }
      } else {
        console.error('Failed to retrieve access token');
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to retrieve access token.');
      }
    });
  });

  tokenReq.on('error', (e) => {
    console.error(`Problem with token request: ${e.message}`);
  });

  tokenReq.write(postData);
  tokenReq.end();
};

http
  .createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    console.log(`Received request for: ${reqUrl.pathname}`);

    if (reqUrl.pathname === '/oauth/callback' && reqUrl.query.code) {
      handleAuthCallback(reqUrl, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  })
  .listen(3000, () => {
    console.log('Server started on http://localhost:3000');

    // Open the authorization URL in the default browser
    exec(`start "" "${authorizationUrl}"`, (error) => {
      if (error) {
        console.error(`Could not open browser: ${error.message}`);
      } else {
        console.log('Opening default browser for OAuth authorization...');
      }
    });
  });
