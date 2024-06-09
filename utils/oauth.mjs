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
const authorizationUrl = `${
  config.AUTHORIZATION_URL
}?audience=api.atlassian.com&client_id=${
  config.CLIENT_ID
}&scope=${encodeURIComponent(
  'offline_access read:confluence-content.all read:confluence-user read:confluence-groups write:confluence-groups write:confluence-space write:confluence-content write:confluence-props'
)}&redirect_uri=${encodeURIComponent(
  config.REDIRECT_URI
)}&state=${state}&response_type=code&prompt=consent`;

/**
 * Parses the .env file and returns the configuration as an object.
 * @returns {Object} The environment configuration.
 */
const readEnvConfig = () => {
  return readFileSync('.env', 'utf8')
    .split('\n')
    .reduce((obj, line) => {
      const [key, value] = line.split('=');
      if (key && value) obj[key.trim()] = value.trim();
      return obj;
    }, {});
};

/**
 * Saves the provided configuration to the .env file.
 * @param {Object} config - The configuration to save.
 */
const saveEnvConfig = (config) => {
  const updatedConfig = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  writeFileSync('.env', updatedConfig);
};

/**
 * Updates the .env file with new tokens and cloud ID.
 * @param {string} accessToken - The access token.
 * @param {string} refreshToken - The refresh token.
 * @param {number} expiresIn - The token expiration time in seconds.
 * @param {string} cloudId - The cloud ID.
 */
const updateEnvConfig = (accessToken, refreshToken, expiresIn, cloudId) => {
  const tokenExpirationTime = Date.now() + expiresIn * 1000;
  const envConfig = readEnvConfig();
  envConfig.ACCESS_TOKEN = accessToken;
  envConfig.REFRESH_TOKEN = refreshToken;
  envConfig.TOKEN_EXPIRATION_TIME = tokenExpirationTime.toString();
  envConfig.CLOUD_ID = cloudId;
  saveEnvConfig(envConfig);
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
      getCloudId(
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.expires_in,
        res
      );
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
 * Retrieves the cloud ID for the site.
 * @param {string} accessToken - The access token.
 * @param {string} refreshToken - The refresh token.
 * @param {number} expiresIn - The token expiration time in seconds.
 * @param {Object} res - The response object.
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
        try {
          const cloudResponse = JSON.parse(cloudData);
          console.log('Cloud Response:', cloudResponse);
          const cloudId = cloudResponse[0].id; // Assuming the first entry is the required cloud ID
          updateEnvConfig(accessToken, refreshToken, expiresIn, cloudId);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('OAuth flow completed. You can now close this window.');
        } catch (error) {
          console.error('Failed to parse JSON response:', error.message);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to parse JSON response.');
        }
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
  });

  req.end();
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
        const { code } = reqUrl.query;
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
    .listen(config.PORT, () => {
      console.log(`Server started on http://localhost${config.PORT}`);
      exec(`start "" "${authorizationUrl}"`, (error) => {
        if (error) console.error(`Could not open browser: ${error.message}`);
      });
    });
};

// Start the server
createServer();
