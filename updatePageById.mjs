import { makeApiRequest } from './utils/request.mjs';
import { fetchPageById } from './fetchPageById.mjs';

/**
 * Updates a page by its ID.
 * @async
 * @function updatePageById
 * @param {string} pageId - The ID of the page to update.
 * @param {string} title - The new title of the page.
 * @param {string} bodyContent - The new body content of the page.
 * @param {number} [versionNumber] - The new version number of the page.
 * @returns {Promise<void>} A Promise that resolves when the page is updated.
 * @throws {Error} If there is an error updating the page.
 */
const updatePageById = async (pageId, title, bodyContent) => {
  try {
    const pageDetails = await fetchPageById(pageId);
    const currentVersion = pageDetails.version.number;
    const versionNumber = currentVersion + 1;
    const path = `/wiki/rest/api/content/${pageId}`;
    const bodyData = {
      id: pageId,
      type: 'page',
      status: 'current',
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

    const response = await makeApiRequest(path, 'PUT', bodyData);
    console.log(`Response: ${response.statusCode} ${response.statusMessage}`);
    console.log('Updated page response:', response);
  } catch (error) {
    console.error('Error updating page:', error.message);
  }
};

// Get the command line arguments
const args = process.argv.slice(2);
const [pageId, title, bodyContent, versionNumber] = args;

if (!pageId || !title || !bodyContent) {
  console.error(
    'Please provide all the required arguments: pageId, title, bodyContent, [versionNumber]'
  );
  process.exit(1);
}

// Call the update function with the provided arguments
updatePageById(pageId, title, bodyContent);
