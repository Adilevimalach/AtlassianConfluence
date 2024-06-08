import { makeApiRequest } from './utils/request.mjs';

const fetchAllPages = async () => {
  const path = '/wiki/rest/api/content?/wiki/api/v2/pages';
  try {
    const response = await makeApiRequest(path);
    console.log('Fetched pages:', response);
  } catch (error) {
    console.error('Error fetching pages:', error.message);
  }
};

// Run the function
fetchAllPages();
