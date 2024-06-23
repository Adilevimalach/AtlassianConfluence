import http from 'http';
import url from 'url';
import { config } from '../config.js';
import { exec } from 'child_process';
import crypto from 'crypto';
import { updateEnvConfig } from './configUtils.js';
import { safeJsonParse } from './helpers.js';
import fetch from 'node-fetch';

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
 * @param {Object} tokenResponse - The token response data.
 */
const handleTokenResponse = async (res, tokenResponse) => {
  try {
    await getCloudId(
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      tokenResponse.expires_in,
      res
    );
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
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
const getCloudId = async (accessToken, refreshToken, expiresIn, res) => {
  const url = 'https://api.atlassian.com/oauth/token/accessible-resources';
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  };

  try {
    const cloudRes = await fetch(url, options);
    const cloudData = await cloudRes.json();

    if (!cloudRes.ok) {
      throw new Error(
        `Failed to retrieve cloud ID: ${cloudRes.status} ${cloudRes.statusText}`
      );
    }

    console.log('Cloud Response:', cloudData);
    const cloudId = cloudData[0].id;
    updateEnvConfig(accessToken, refreshToken, expiresIn, cloudId);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OAuth flow completed. You can now close this window.');
  } catch (error) {
    console.error('Failed to retrieve cloud ID:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Failed to retrieve cloud ID.');
  }
};

/**
 * Handles OAuth callback by exchanging authorization code for tokens.
 * @param {Object} res - The HTTP response object.
 * @param {string} code - The authorization code.
 */
const handleOAuthCallback = async (res, code) => {
  const url = 'https://auth.atlassian.com/oauth/token';
  const postData = {
    grant_type: 'authorization_code',
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET,
    code,
    redirect_uri: config.REDIRECT_URI,
  };

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  };

  try {
    const tokenRes = await fetch(url, options);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(
        `Failed to retrieve access token: ${tokenRes.status} ${tokenRes.statusText}`
      );
    }

    await handleTokenResponse(res, tokenData);
  } catch (error) {
    console.error('Problem with token request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error requesting token.');
  }
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
