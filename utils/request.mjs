import https from 'https';
import { config } from '../config.mjs';

/**
 * Makes an API request to the Atlassian Confluence API using OAuth2.
 *
 * @param {string} path - The API endpoint path.
 * @param {string} [method='GET'] - The HTTP method for the request.
 * @param {Object} [data=null] - The data to send with the request.
 * @param {Object} [headers={}] - Additional headers for the request.
 * @returns {Promise} A promise that resolves with the response data.
 */
export const makeApiRequest = (
  path,
  method = 'GET',
  data = null,
  headers = {}
) => {
  // Construct the full request URL
  const fullPath = `/ex/confluence/${config.cloudId}${path}`;
  const options = {
    hostname: 'api.atlassian.com',
    path: fullPath,
    method,
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  console.log('Request Options:', options);

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`Response: ${res.statusCode} ${res.statusMessage}`);
        console.log('Response Headers:', res.headers);
        console.log('Response Body:', responseData);

        if (res.statusCode === 204) {
          resolve('No content');
        } else if (
          res.headers['content-type'] &&
          res.headers['content-type'].includes('application/json')
        ) {
          try {
            const jsonResponse = JSON.parse(responseData);
            resolve(jsonResponse);
          } catch (error) {
            reject(new Error('Failed to parse JSON response: ' + responseData));
          }
        } else {
          resolve(responseData);
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
