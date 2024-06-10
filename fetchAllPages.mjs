import { makeApiRequest } from './utils/request.mjs';

/**
 * Fetches all pages from the Confluence API.
 * @returns {Promise<void>} A promise that resolves when all pages are fetched.
 */
const fetchAllPages = async () => {
  try {
    const queryParams = new URLSearchParams({
      type: 'page',
      spaceKey: 'APPINT',
      status: 'current',
      expand: 'space,history,version',
      start: 0,
      limit: 25,
    }).toString();

    const response = await makeApiRequest(
      `/wiki/rest/api/content?${queryParams}`,
      'GET'
    );
    console.log('Fetched pages response:', response);
  } catch (error) {
    console.error('Error fetching pages:', error);
  }
};

// Fetch all pages
fetchAllPages();
