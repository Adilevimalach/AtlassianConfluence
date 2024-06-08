import { makeApiRequest } from './utils/request.mjs';

/**
 * Fetches a page by its ID.
 * @async
 * @function fetchPageById
 * @param {string} id - The ID of the page to fetch.
 * @returns {Promise<void>} A Promise that resolves when the page is fetched.
 * @throws {Error} If there is an error fetching the page.
 */
const fetchPageById = async (id) => {
  const path = `/wiki/rest/api/content/${id}`;
  try {
    const response = await makeApiRequest(path);
    console.log('Fetched page:', response);
  } catch (error) {
    console.error('Error fetching page:', error.message);
  }
};

// Get the page ID from command line arguments
const args = process.argv.slice(2);
const pageId = args[0];

if (!pageId) {
  console.error('Please provide a page ID as an argument');
  process.exit(1);
}

// Call the fetch function with the provided page ID
fetchPageById(pageId);
