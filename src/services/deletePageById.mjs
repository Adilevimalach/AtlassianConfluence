// This script deletes a page by its ID using the Confluence Cloud REST API.
import { makeApiRequest } from '../utils/request.mjs';

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
