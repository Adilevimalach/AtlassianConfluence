import fetch from 'node-fetch';
import { refreshAccessToken } from './configUtils.js';
import { isAccessTokenExpired, constructRequestOptions } from './helpers.js';

const sendApiRequest = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`
      );
    }
    return responseData;
  } catch (error) {
    throw new Error(`Problem with request: ${error.message}`);
  }
};

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
  const url = `https://api.atlassian.com${options.path}`;
  try {
    return await sendApiRequest(url, options);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      await refreshAccessToken();
      return await sendApiRequest(url, options);
    } else {
      throw error;
    }
  }
};
