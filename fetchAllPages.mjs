import { makeApiRequest } from './utils/request.mjs';
import { printPages } from './utils/printPageDatautils.mjs';

/**
 * Fetches all pages from the Confluence API .
 * (opitonial) set the spaceKey to {spacekey} to fetch all pages from the {namespace} space.
 * @param {string} spaceKey - The key of the space to fetch pages from.
 * @returns {Promise<void>} - A promise that resolves when all pages are fetched.
 */
const fetchAllPages = async (spaceKey) => {
  try {
    const queryParams = new URLSearchParams({
      type: 'page',
      status: 'current',
      expand: 'version',
      start: 0,
      limit: 25,
    });
    if (spaceKey) {
      queryParams.append('spaceKey', spaceKey);
    }
    const queryParamsString = queryParams.toString();

    const response = await makeApiRequest(
      `/wiki/rest/api/content?${queryParamsString}`,
      'GET'
    );
    console.log(response.results);
    printPages(response.results);
  } catch (error) {
    console.error('Error fetching pages:', error);
  }
};

// Get the space key from the command line arguments
const spaceKey = process.argv[2];

// Fetch all pages (or pages by space key if provided)
fetchAllPages(spaceKey);
