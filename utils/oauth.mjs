import http from 'http';
import https from 'https';
import url from 'url';
import { config } from '../config.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import crypto from 'crypto';

// Generate a secure random state value
const state = crypto.randomBytes(16).toString('hex');

/**
 * The authorization URL used for OAuth authentication.
 */
const authorizationUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${
  config.clientId
}&scope=${encodeURIComponent(
  'read:confluence-content.all read:confluence-user read:confluence-groups write:confluence-groups write:confluence-space write:confluence-content write:confluence-props'
)}&redirect_uri=${encodeURIComponent(
  config.redirectUri
)}&state=${state}&response_type=code&prompt=consent`;

/**
 * Saves the access token and expiration time to the environment file.
 * @param {string} accessToken - The access token.
 * @param {number} expiresIn - The token expiration time in seconds.
 */
const saveTokenConfig = (accessToken, expiresIn) => {
  const tokenExpirationTime = Date.now() + expiresIn * 1000;
  process.env.ACCESS_TOKEN = accessToken;
  process.env.TOKEN_EXPIRATION_TIME = tokenExpirationTime.toString();

  // Load the existing .env file
  const envConfig = readFileSync('.env', 'utf8')
    .split('\n')
    .reduce((obj, line) => {
      const [key, value] = line.split('=');
      obj[key.trim()] = value.trim();
      return obj;
    }, {});

  // Update the desired properties
  envConfig.ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  envConfig.TOKEN_EXPIRATION_TIME = process.env.TOKEN_EXPIRATION_TIME;

  // Convert the updated object back to a string
  const updatedConfig = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Write the updated string back to the .env file
  writeFileSync('.env', updatedConfig);
};

/**
 * Handles the token response received from the OAuth server.
 * @param {Object} res - The response object.
 * @param {string} tokenData - The token data received from the server.
 * @param {Object} tokenRes - The token response object.
 */
const handleTokenResponse = (res, tokenData, tokenRes) => {
  if (tokenRes.statusCode >= 200 && tokenRes.statusCode < 300) {
    try {
      const tokenResponse = JSON.parse(tokenData);
      console.log('Token Response:', tokenResponse);
      saveTokenConfig(tokenResponse.access_token, tokenResponse.expires_in);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OAuth flow completed. You can now close this window.');
    } catch (error) {
      console.error('Failed to parse JSON response:', error.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Failed to parse JSON response.');
    }
  } else {
    console.error(
      'Failed to retrieve access token:',
      tokenRes.statusCode,
      tokenData
    );
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Failed to retrieve access token.');
  }
};

/**
 * Creates an HTTP server to handle OAuth callback.
 */
const createServer = () => {
  http
    .createServer((req, res) => {
      const reqUrl = url.parse(req.url, true);
      console.log(`Received request for: ${reqUrl.pathname}`);

      if (reqUrl.pathname === '/oauth/callback' && reqUrl.query.code) {
        const { code } = reqUrl.query;
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
            handleTokenResponse(res, tokenData, tokenRes);
          });
        });

        tokenReq.on('error', (e) => {
          console.error(`Problem with token request: ${e.message}`);
        });

        tokenReq.write(postData);
        tokenReq.end();
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    })
    .listen(3000, () => {
      console.log('Server started on http://localhost:3000');
      exec(`start "" "${authorizationUrl}"`, (error) => {
        if (error) {
          console.error(`Could not open browser: ${error.message}`);
        } else {
          console.log('Opening default browser for OAuth authorization...');
        }
      });
    });
};

// Start the server
createServer();
