import https from 'https';
import { config } from '../config.mjs';
import { refreshAccessToken } from './configUtils.mjs';

/**
 * Checks if the access token is expired.
 * @returns {boolean} True if the access token is expired, otherwise false.
 */
const isAccessTokenExpired = () => {
  const expirationTime = parseInt(config.TOKEN_EXPIRATION_TIME, 10);
  return Date.now() > expirationTime;
};

/**
 * Constructs the request options for the API call.
 * @param {string} path - The API endpoint path.
 * @param {string} method - The HTTP method for the request.
 * @param {Object} headers - Additional headers for the request.
 * @returns {Object} The request options.
 */
const constructRequestOptions = (path, method, headers) => {
  const fullPath = encodeURI(`/ex/confluence/${config.CLOUD_ID}${path}`);
  return {
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
};

/**
 * Parses JSON data and handles errors.
 * @param {string} data - The JSON string to parse.
 * @returns {Object} The parsed JSON object.
 */
const safeJsonParse = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse JSON:', error.message);
    throw new Error('Failed to parse JSON response.');
  }
};

/**
 * Makes an API request to the Atlassian Confluence API using OAuth2.
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

  const options = constructRequestOptions(path, method, headers);

  /**
   * Sends the API request.
   * @returns {Promise} A promise that resolves with the response data.
   */
  const requestApi = () => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          // console.log('API response:', res.statusCode, responseData);
          if (res.statusCode === 401) {
            reject(new Error('Unauthorized'));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            if (
              res.headers['content-type'] &&
              res.headers['content-type'].includes('application/json')
            ) {
              try {
                const jsonResponse = safeJsonParse(responseData);
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
      // console.log('Retrying with refreshed token...');
      // options.headers.Authorization = `Bearer ${config.ACCESS_TOKEN}`;
      return await requestApi();
    } else {
      throw error;
    }
  }
};
