import fs from 'fs';

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
