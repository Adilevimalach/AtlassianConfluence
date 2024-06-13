import { readFileSync } from 'fs';

const loadEnvVariables = () => {
  const envConfig = readFileSync('.env', 'utf8')
    .split('\n')
    .reduce((obj, line) => {
      const [key, value] = line.split('=');
      if (key && value) obj[key.trim()] = value.trim();
      return obj;
    }, {});

  for (const [key, value] of Object.entries(envConfig)) {
    process.env[key] = value;
  }
};

loadEnvVariables();

export const config = {
  BASE_URL: process.env.BASE_URL,
  SPACE_KEY: process.env.SPACE_KEY,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URI: process.env.REDIRECT_URI,
  USERNAME: process.env.USERNAME,
  TOKEN_EXPIRATION_TIME: process.env.TOKEN_EXPIRATION_TIME,
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  CLOUD_ID: process.env.CLOUD_ID,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  PORT: process.env.PORT,
  AUTHORIZATION_URL: process.env.AUTHORIZATION_URL,
  TOKEN_URL: process.env.TOKEN_URL,
  DEFAULT_EXPAND: process.env.DEFAULT_EXPAND,
};
