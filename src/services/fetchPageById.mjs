// Code to fetch a page by its ID.
import { printPages } from '../utils/printPageDatautils.mjs';
import { makeApiRequest } from '../utils/request.mjs';
import { constructExpandParam } from '../utils/helpers.mjs';

/**
 * Fetches a page by its ID.
 * @async
 * @function fetchPageById
 * @param {string} id - The ID of the page to fetch.
 * @returns {Promise<void>} A Promise that resolves when the page is fetched.
 * @throws {Error} If there is an error fetching the page.
 */
export const fetchPageById = async (id) => {
  try {
    const queryParams = new URLSearchParams({
      type: 'page',
      id: id,
    }).toString();
    const expandParam = constructExpandParam();
    const url = `/wiki/rest/api/content?${queryParams}&${expandParam}`;
    const response = await makeApiRequest(url, 'GET');

    printPages(response.results);
    return response.results[0];
  } catch (error) {
    console.error('Error fetching page:', error.message);
  }
};
