import { makeApiRequest } from '../utils/request.mjs';
import { constructExpandParam, constructCQL } from '../utils/helpers.mjs';

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

/**
 * Fetches pages updated up to a specified date.
 * @async
 * @function fetchByUpDate
 * @param {string} updateDate - The date up to which pages were updated (in YYYY-MM-DD format).
 * @returns {Promise<void>} A Promise that resolves when the pages are fetched.
 * @throws {Error} If there is an error fetching the pages.
 */
export const fetchByUpDate = async (updateDate) => {
  try {
    const expandParam = constructExpandParam();
    const cqlParams = {
      type: 'page',
      'lastmodified >': updateDate, //have a bug need to fix(need to get the correct data from the api, now it show me who not updated since the date and not the yes, tried to change the > to < that not work for me now, need to fix it later)
    };
    const cql = `${constructCQL(cqlParams)}&${expandParam}`;
    const path = `/wiki/rest/api/content/search?${cql}`;
    const response = await makeApiRequest(path, 'GET');
    console.log(
      `Fetched pages updated up to ${updateDate}:`,
      JSON.stringify(response, null, 2)
    );
    return response.results;
  } catch (error) {
    console.error('Error fetching pages:', error.message);
  }
};

/**
 * Deletes a page by its ID.
 * @async
 * @function deletePageById
 * @param {string} pageId - The ID of the page to delete.
 * @returns {Promise<void>} A Promise that resolves when the page is deleted.
 * @throws {Error} If there is an error deleting the page.
 */
export const deletePageById = async (pageId) => {
  try {
    const path = `/wiki/rest/api/content/${pageId}`;
    const response = await makeApiRequest(path, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error deleting page:', error.message);
  }
};

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
    return response.results[0];
  } catch (error) {
    console.error('Error fetching page:', error.message);
  }
};

/**
 * Updates a Confluence page by its ID.
 * @async
 * @param {string} pageId - The ID of the page to update.
 * @param {string} title - The new title of the page.
 * @param {string} bodyContent - The new body content of the page.
 * @returns {Promise<void>} A Promise that resolves when the page is updated.
 * @throws {Error} If there is an error updating the page.
 */
export const updatePageById = async (pageId, title, bodyContent) => {
  try {
    // Fetch the current page details
    const pageDetails = await fetchPageById(pageId);

    // Validate page details and version
    if (!pageDetails?.version?.number) {
      throw new Error('Page version details not found');
    }

    const versionNumber = pageDetails.version.number + 1;

    const path = `/wiki/rest/api/content/${pageId}`;
    const bodyData = {
      id: pageId,
      type: 'page',
      title,
      body: {
        storage: {
          value: bodyContent,
          representation: 'storage',
        },
      },
      version: {
        number: versionNumber,
        message: 'Updated version',
      },
    };

    // Update the page with the new content
    const response = await makeApiRequest(path, 'PUT', bodyData);
    return response;
  } catch (error) {
    console.error('Error updating page:', error.message);
  }
};
