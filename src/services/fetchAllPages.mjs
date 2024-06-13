// This service fetches all pages from the Confluence API and prints them to the console.
import { makeApiRequest } from '../utils/request.mjs';
import { constructExpandParam } from '../utils/helpers.mjs';

/**
 * Fetches all pages from the Confluence API .
 * (opitonial) set the spaceKey to {spacekey} to fetch all pages from the {namespace} space.
 * @param {string} spaceKey - The key of the space to fetch pages from.
 * @returns {Promise<void>} - A promise that resolves when all pages are fetched.
 */
export const fetchAllPages = async (
  spaceKey = null,
  offset = 0,
  limit = 25
) => {
  try {
    const queryParams = new URLSearchParams({
      type: 'page',
      start: offset,
      limit: limit,
    });
    if (spaceKey) {
      queryParams.append('spaceKey', spaceKey);
    }
    const queryParamsString = queryParams.toString();
    const expandParam = constructExpandParam();
    const url = `/wiki/rest/api/content?${queryParamsString}&${expandParam}`;
    const response = await makeApiRequest(url, 'GET');
    return response.results;
  } catch (error) {
    console.error('Error fetching pages:', error);
  }
};
