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
    console.log(`Fetched ${response.results.length} pages:`);
    response.results.forEach((page, index) => {
      console.log(`Page ${index + 1}:`);
      console.log(`ID: ${page.id}`);
      console.log(`Type: ${page.type}`);
      console.log(`Status: ${page.status}`);
      console.log(`Title: ${page.title}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
  }
};

// Fetch all pages
fetchAllPages();
