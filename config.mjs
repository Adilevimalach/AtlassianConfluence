import { readFileSync } from 'fs';

const loadEnvVariables = () => {
  const envConfig = readFileSync('.env', 'utf8')
    .split('\n')
    .reduce((obj, line) => {
      const [key, value] = line.split('=');
      obj[key] = value;
      return obj;
    }, {});

  // Load the environment variables into process.env
  for (const [key, value] of Object.entries(envConfig)) {
    process.env[key] = value;
  }
};

loadEnvVariables();

export const config = {
  baseURL: process.env.BASE_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  username: process.env.USERNAME,
  tokenExpirationTime: process.env.TOKEN_EXPIRATION_TIME,
  accessToken: process.env.ACCESS_TOKEN,
};
