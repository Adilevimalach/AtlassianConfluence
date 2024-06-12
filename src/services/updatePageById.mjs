// This module updates a Confluence page by its ID.
import { makeApiRequest } from '../utils/request.mjs';
import { fetchPageById } from './fetchPageById.mjs';

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
    console.log('Updated page response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error updating page:', error.message);
  }
};
