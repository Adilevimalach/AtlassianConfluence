// This script checks the accessible resources and scopes for the app using the access token.
import fetch from 'node-fetch';
import { config } from '../config.js';

/**
 * Checks the accessible resources for the app using the access token.
 *
 * @returns {Promise} A promise that resolves with the response data.
 */
export const checkAccessibleResources = async () => {
  const url = 'https://api.atlassian.com/oauth/token/accessible-resources';
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`
      );
    }
    const responseData = await response.json();
    console.log(`Response: ${response.status} ${response.statusText}`);
    console.log('Response Headers:', response.headers.raw());
    console.log('Response Body:', responseData);
    return responseData;
  } catch (error) {
    throw new Error(`Problem with request: ${error.message}`);
  }
};
