import https from 'https';
import { config } from '../config.mjs';
import fs from 'fs';

/**
 * Refreshes the access token using the refresh token.
 *
 * @returns {Promise<void>} A promise that resolves when the token is refreshed.
 */
const refreshAccessToken = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      grant_type: 'refresh_token',
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      refresh_token: config.REFRESH_TOKEN,
    });

    const options = {
      hostname: 'auth.atlassian.com',
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log('Refreshing access token...');

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        // console.log('Refresh token response:', res.statusCode, responseData);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonResponse = JSON.parse(responseData);
            // console.log('Refreshed token:', jsonResponse);
            config.ACCESS_TOKEN = jsonResponse.access_token;
            config.REFRESH_TOKEN = jsonResponse.refresh_token;
            config.TOKEN_EXPIRATION_TIME = (
              Date.now() +
              jsonResponse.expires_in * 1000
            ).toString();
            saveEnvConfig({
              ACCESS_TOKEN: jsonResponse.access_token,
              REFRESH_TOKEN: jsonResponse.refresh_token,
              TOKEN_EXPIRATION_TIME: config.TOKEN_EXPIRATION_TIME,
            });
            resolve();
          } catch (error) {
            reject(new Error('Failed to parse JSON response: ' + responseData));
          }
        } else {
          reject(new Error('Failed to refresh token: ' + responseData));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Problem with token refresh request: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Saves the provided configuration to the .env file.
 * @param {Object} config - The configuration to save.
 */
const saveEnvConfig = (newConfig) => {
  const envConfig = readEnvConfig();
  const updatedConfig = { ...envConfig, ...newConfig };
  const configString = Object.entries(updatedConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  fs.writeFileSync('.env', configString);
};

/**
 * Parses the .env file and returns the configuration as an object.
 * @returns {Object} The environment configuration.
 */
const readEnvConfig = () => {
  return fs
    .readFileSync('.env', 'utf8')
    .split('\n')
    .reduce((obj, line) => {
      const [key, value] = line.split('=');
      if (key && value) obj[key.trim()] = value.trim();
      return obj;
    }, {});
};

/**
 * Checks if the access token is expired.
 *
 * @returns {boolean} True if the access token is expired, otherwise false.
 */
const isAccessTokenExpired = () => {
  const expirationTime = parseInt(config.TOKEN_EXPIRATION_TIME, 10);
  return Date.now() > expirationTime;
};

/**
 * Makes an API request to the Atlassian Confluence API using OAuth2.
 *
 * @param {string} path - The API endpoint path.
 * @param {string} [method='GET'] - The HTTP method for the request.
 * @param {Object} [data=null] - The data to send with the request.
 * @param {Object} [headers={}] - Additional headers for the request.
 * @returns {Promise} A promise that resolves with the response data.
 */
export const makeApiRequest = async (
  path,
  method = 'GET',
  data = null,
  headers = {}
) => {
  if (isAccessTokenExpired()) {
    console.log('Access token expired. Refreshing token...');
    await refreshAccessToken();
  }

  const fullPath = encodeURI(`/ex/confluence/${config.CLOUD_ID}${path}`);
  const options = {
    hostname: 'api.atlassian.com',
    path: fullPath,
    method,
    headers: {
      Authorization: `Bearer ${config.ACCESS_TOKEN}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  const requestApi = () => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          console.log('API response:', res.statusCode, responseData);
          if (res.statusCode === 401) {
            reject(new Error('Unauthorized'));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            if (
              res.headers['content-type'] &&
              res.headers['content-type'].includes('application/json')
            ) {
              try {
                const jsonResponse = JSON.parse(responseData);
                resolve(jsonResponse);
              } catch (error) {
                reject(
                  new Error('Failed to parse JSON response: ' + responseData)
                );
              }
            } else {
              resolve(responseData);
            }
          } else {
            reject(new Error('Request failed: ' + responseData));
          }
        });
      });

      req.on('error', (e) => {
        reject(new Error(`Problem with request: ${e.message}`));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  };

  try {
    return await requestApi();
  } catch (error) {
    if (error.message === 'Unauthorized') {
      // Refresh token and retry request
      //await refreshAccessToken();
      options.headers.Authorization = `Bearer ${config.ACCESS_TOKEN}`;
      return await requestApi();
    } else {
      throw error;
    }
  }
};
