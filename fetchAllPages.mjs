import { makeApiRequest } from './utils/request.mjs';

/**
 * Fetches all pages from the Confluence API .
 * (opitonial)set the spaceKey to {spacekey} to fetch all pages from the {namespace} space.
 * @param {string} spaceKey - The key of the space to fetch pages from.
 * @returns {Promise<void>} - A promise that resolves when all pages are fetched.
 */
const fetchAllPages = async (spaceKey = '') => {
  try {
    const queryParams = new URLSearchParams({
      type: 'page',
      spaceKey: spaceKey,
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
