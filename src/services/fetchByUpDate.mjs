// This service fetches pages updated up to a specified date.
import { makeApiRequest } from '../utils/request.mjs';
import { constructExpandParam, constructCQL } from '../utils/helpers.mjs';

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
