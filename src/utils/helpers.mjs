// This file contains helper functions that are used in multiple places in the application.
import { config } from '../config.mjs';

/**
 * Parses JSON data and handles errors.
 * @param {string} data - The JSON string to parse.
 * @returns {Object} The parsed JSON object.
 * @throws {Error} If the JSON parsing fails or data is empty.
 */
export const safeJsonParse = (data) => {
  if (!data) {
    throw new Error('Received empty data to parse.');
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Failed to parse JSON response: ' + data);
  }
};

/**
 * Constructs the request options for the API call.
 * @param {string} path - The API endpoint path.
 * @param {string} method - The HTTP method for the request.
 * @param {Object} headers - Additional headers for the request.
 * @returns {Object} The request options.
 */
export const constructRequestOptions = (path, method, headers) => {
  const defaultHeaders = {
    Authorization: `Bearer ${config.ACCESS_TOKEN}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const combinedHeaders = { ...defaultHeaders, ...headers };
  const fullPath = encodeURI(`/ex/confluence/${config.CLOUD_ID}${path}`);
  return {
    hostname: 'api.atlassian.com',
    path: fullPath,
    method,
    headers: combinedHeaders,
  };
};

/**
 * Constructs the expand parameter string using default expands from config.
 * @returns {string} The constructed expand parameter string.
 */
export const constructExpandParam = () => {
  // Split the default expands from the .env file
  const defaultExpands = config.DEFAULT_EXPAND.split(',');
  // Convert the set to a string for the query parameter
  return `expand=${defaultExpands.join(',')}`;
};

/**
 * Constructs the CQL query string.
 * @param {Object} queryParams - An object containing the CQL query parameters.
 * @returns {string} The constructed CQL query string.
 */
export const constructCQL = (queryParams) => {
  const cqlParts = Object.entries(queryParams).map(
    ([key, value]) => `${key}="${value}"`
  );
  return `cql=${cqlParts.join('&')}`;
};

/**
//  * Checks if the access token is expired.
//  * @returns {boolean} True if the access token is expired, otherwise false.
//  */
export const isAccessTokenExpired = () => {
  const expirationTime = parseInt(config.TOKEN_EXPIRATION_TIME, 10);
  return Date.now() > expirationTime;
};
