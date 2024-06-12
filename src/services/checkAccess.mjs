// This script checks the accessible resources and scopes for the app using the access token.
import https from 'https';
import { config } from '../config.mjs';

/**
 * Checks the accessible resources for the app using the access token.
 *
 * @returns {Promise} A promise that resolves with the response data.
 */
const checkAccessibleResources = () => {
  const options = {
    hostname: 'api.atlassian.com',
    path: '/oauth/token/accessible-resources',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.ACCESS_TOKEN}`,
      Accept: 'application/json',
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

    req.end();
  });
};

// Call the function to check accessible resources
checkAccessibleResources()
  .then((response) => {
    console.log('Accessible Resources:', response);
  })
  .catch((error) => {
    console.error('Error Checking Accessible Resources:', error);
  });
