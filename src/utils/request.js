// Handles the request to the Atlassian Confluence API using OAuth2

import https from 'https';
import { refreshAccessToken } from './configUtils.js';
import {
  safeJsonParse,
  isAccessTokenExpired,
  constructRequestOptions,
} from './helpers.js';

/**
 * Sends the API request.
 * @param {Object} options - The request options.
 * @param {Object} [data=null] - The data to send with the request.
 * @returns {Promise} A promise that resolves with the response data.
 */
const sendApiRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        // Handle unauthorized status
        if (res.statusCode === 401) {
          reject(new Error('Unauthorized'));
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          // Handle successful response
          if (
            responseData &&
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
            // Return non-JSON response data
            resolve({
              statusCode: res.statusCode,
              statusMessage: res.statusMessage,
              data: responseData,
            });
          }
        } else {
          // Handle other error statuses
          reject(
            new Error(`Request failed: ${res.statusCode} ${res.statusMessage}`)
          );
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
    await refreshAccessToken();
  }

  const options = constructRequestOptions(path, method, headers);

  try {
    return await sendApiRequest(options, data);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      await refreshAccessToken();
      return await sendApiRequest(options, data);
    } else {
      throw error;
    }
  }
};
