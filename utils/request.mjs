import https from 'https';
import { config } from '../config.mjs';

/**
 * Makes an API request.
 *
 * @param {string} path - The API endpoint path.
 * @param {string} [method='GET'] - The HTTP method for the request.
 * @param {Object} [data=null] - The data to send with the request.
 * @returns {Promise} A promise that resolves with the response data.
 */
export const makeApiRequest = (path, method = 'GET', data = null) => {
  const { apiToken, email, baseURL } = config;

  const options = {
    hostname: new URL(baseURL).hostname,
    path,
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString(
        'base64'
      )}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

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
          // No content to parse, resolve with a message
          console.log('Page successfully deleted');
          resolve('Page successfully deleted');
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
