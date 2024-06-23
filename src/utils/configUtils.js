// This module contains utility functions for managing the configuration.

import fs from 'fs';
import { config } from '../config.js';

/**
 * Saves the provided configuration to the .env file.
 * @param {Object} newConfig - The new configuration to save.
 */
export const saveEnvConfig = (newConfig) => {
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
export const readEnvConfig = () => {
  return fs
    .readFileSync('.env', 'utf8')
    .split('\n')
    .reduce((configObj, line) => {
      const [key, value] = line.split('=');
      if (key && value) configObj[key.trim()] = value.trim();
      return configObj;
    }, {});
};

/**
 * Refreshes the access token by making a request to the authentication server.
 * @throws {Error} If there is a problem with the token refresh request.
 */
export const refreshAccessToken = async () => {
  try {
    const postData = JSON.stringify({
      grant_type: 'refresh_token',
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      refresh_token: config.REFRESH_TOKEN,
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    };

    const response = await fetch(
      'https://auth.atlassian.com/oauth/token',
      options
    );
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        'Failed to refresh token: ' + responseData.error_description
      );
    }

    config.ACCESS_TOKEN = responseData.access_token;
    config.REFRESH_TOKEN = responseData.refresh_token;
    config.TOKEN_EXPIRATION_TIME = (
      Date.now() +
      responseData.expires_in * 1000
    ).toString();

    saveEnvConfig({
      ACCESS_TOKEN: responseData.access_token,
      REFRESH_TOKEN: responseData.refresh_token,
      TOKEN_EXPIRATION_TIME: config.TOKEN_EXPIRATION_TIME,
    });
  } catch (error) {
    throw new Error('Problem with token refresh request: ' + error.message);
  }
};

/**
 * Updates the .env file with new tokens and cloud ID.
 * @param {string} accessToken - The access token.
 * @param {string} refreshToken - The refresh token.
 * @param {number} expiresIn - The token expiration time in seconds.
 * @param {string} cloudId - The cloud ID.
 */
export const updateEnvConfig = (
  accessToken,
  refreshToken,
  expiresIn,
  cloudId
) => {
  const tokenExpirationTime = Date.now() + expiresIn * 1000;
  const envConfig = readEnvConfig();
  envConfig.ACCESS_TOKEN = accessToken;
  envConfig.REFRESH_TOKEN = refreshToken;
  envConfig.TOKEN_EXPIRATION_TIME = tokenExpirationTime.toString();
  envConfig.CLOUD_ID = cloudId;
  saveEnvConfig(envConfig);
};
