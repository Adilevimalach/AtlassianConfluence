import fs from 'fs';

/**
 * Saves the provided configuration to the .env file.
 * @param {Object} config - The configuration to save.
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
    .reduce((obj, line) => {
      const [key, value] = line.split('=');
      if (key && value) obj[key.trim()] = value.trim();
      return obj;
    }, {});
};

/**
 * Refreshes the access token using the refresh token.
 *
 * @returns {Promise<void>} A promise that resolves when the token is refreshed.
 */
export const refreshAccessToken = () => {
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
