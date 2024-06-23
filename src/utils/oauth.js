// src/utils/oauth.mjs

import http from 'http';
import https from 'https';
import url from 'url';
import { config } from '../config.js';
import { exec } from 'child_process';
import crypto from 'crypto';
import { updateEnvConfig } from './configUtils.js';
import { safeJsonParse } from './helpers.js';

/**
 * Generates a secure random state value for OAuth authentication.
 * @returns {string} The state value.
 */
const generateState = () => crypto.randomBytes(16).toString('hex');

/**
 * Constructs the authorization URL for OAuth authentication.
 * @returns {string} The authorization URL.
 */
const constructAuthorizationUrl = () => {
  const state = generateState();
  return `${config.AUTHORIZATION_URL}?audience=api.atlassian.com&client_id=${
    config.CLIENT_ID
  }&scope=${encodeURIComponent(
    'offline_access read:confluence-content.all read:confluence-user read:confluence-groups write:confluence-groups write:confluence-space write:confluence-content write:confluence-props read:confluence-content.permission read:confluence-content.summary search:confluence'
  )}&redirect_uri=${encodeURIComponent(
    config.REDIRECT_URI
  )}&state=${state}&response_type=code&prompt=consent`;
};

/**
 * Handles the token response received from the OAuth server.
 * @param {Object} res - The HTTP response object.
 * @param {string} tokenData - The token data received from the server.
 * @param {Object} tokenRes - The token response object.
 */
const handleTokenResponse = (res, tokenData, tokenRes) => {
  if (tokenRes.statusCode >= 200 && tokenRes.statusCode < 300) {
    const tokenResponse = safeJsonParse(tokenData);
    getCloudId(
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      tokenResponse.expires_in,
      res
    );
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
 * Retrieves the cloud ID for the site.
 * @param {string} accessToken - The access token.
 * @param {string} refreshToken - The refresh token.
 * @param {number} expiresIn - The token expiration time in seconds.
 * @param {Object} res - The HTTP response object.
 */
const getCloudId = (accessToken, refreshToken, expiresIn, res) => {
  const options = {
    hostname: 'api.atlassian.com',
    path: '/oauth/token/accessible-resources',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  };

  const req = https.request(options, (cloudRes) => {
    let cloudData = '';
    cloudRes.on('data', (chunk) => {
      cloudData += chunk;
    });
    cloudRes.on('end', () => {
      if (cloudRes.statusCode >= 200 && cloudRes.statusCode < 300) {
        const cloudResponse = safeJsonParse(cloudData);
        console.log('Cloud Response:', cloudResponse);
        const cloudId = cloudResponse[0].id;
        updateEnvConfig(accessToken, refreshToken, expiresIn, cloudId);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OAuth flow completed. You can now close this window.');
      } else {
        console.error(
          'Failed to retrieve cloud ID:',
          cloudRes.statusCode,
          cloudData
        );
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to retrieve cloud ID.');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with cloud ID request: ${e.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error retrieving cloud ID.');
  });

  req.end();
};

/**
 * Handles OAuth callback by exchanging authorization code for tokens.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {string} code - The authorization code.
 */
const handleOAuthCallback = (res, code) => {
  const postData = JSON.stringify({
    grant_type: 'authorization_code',
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET,
    code,
    redirect_uri: config.REDIRECT_URI,
  });

  const options = {
    hostname: 'auth.atlassian.com',
    path: '/oauth/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error requesting token.');
  });

  tokenReq.write(postData);
  tokenReq.end();
};

/**
 * Opens the authorization URL in the default web browser.
 */
const openAuthorizationUrl = () => {
  exec(`start "" "${constructAuthorizationUrl()}"`, (error) => {
    if (error) console.error(`Could not open browser: ${error.message}`);
  });
};

/**
 * Creates an HTTP server and handles OAuth callback requests.
 */
const createServer = () => {
  http
    .createServer((req, res) => {
      const reqUrl = url.parse(req.url, true);
      console.log(`Received request for: ${reqUrl.pathname}`);

      if (reqUrl.pathname === '/oauth/callback' && reqUrl.query.code) {
        handleOAuthCallback(res, reqUrl.query.code);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    })
    .listen(config.PORT, () => {
      console.log(`Server started on http://localhost:${config.PORT}`);
      openAuthorizationUrl();
    });
};

// Start the server
createServer();
