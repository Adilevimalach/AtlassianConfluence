// main file to run the appropriate operation based on command-line arguments
import { printPageDetails } from './utils/printPageDatautils.mjs';
import { checkAccessibleResources } from './utils/checkAccess.mjs';
import {
  fetchPageById,
  fetchAllPages,
  updatePageById,
  fetchByUpDate,
  deletePageById,
} from './services/appServices.mjs';

/**
 * Parses command-line arguments.
 * @returns {Object} An object containing parsed arguments.
 */
const parseArguments = () => {
  const args = process.argv.slice(2);
  const [operation, ...params] = args;
  return { operation, params };
};

/**
 * Handles the fetch operation.
 * @param {Array} params - The parameters for the fetch operation.
 */
const handleFetchOperation = async (params) => {
  const [pageId] = params;
  if (!pageId) {
    console.error('Please provide a page ID for the fetch operation.');
    process.exit(1);
  }
  const page = await fetchPageById(pageId);
  printPageDetails(page);
};

/**
 * Handles the update operation.
 * @param {Array} params - The parameters for the update operation.
 */
const handleUpdateOperation = async (params) => {
  const [pageId, title, bodyContent] = params;
  if (!pageId || !title || !bodyContent) {
    console.error(
      'Please provide page ID, title, and body content for the update operation.'
    );
    process.exit(1);
  }
  const response = await updatePageById(pageId, title, bodyContent);
  printPageDetails(response);
};

/**
 * Handles the fetch by update date operation.
 * @param {Array} params - The parameters for the fetch by update date operation.
 */
const handleFetchByUpdateDateOperation = async (params) => {
  const [updateDate] = params;
  if (!updateDate) {
    console.error(
      'Please provide an update date for the fetch by update date operation (YYYY-MM-DD).'
    );
    process.exit(1);
  }
  const pageUpDated = await fetchByUpDate(updateDate);
  printPageDetails(pageUpDated);
};

/**
 * Handles the delete operation.
 * @param {Array} params - The parameters for the delete operation.
 */
const handleDeleteOperation = async (params) => {
  const [pageId] = params;
  if (!pageId) {
    process.exit(1);
  }
  const response = await deletePageById(pageId);
  printPageDetails(response);
};

/**
 * Handles the fetch all pages operation with pagination.
 * @param {Array} params - The parameters for the fetch all pages operation.
 */
const handleFetchAllPagesOperation = async (params) => {
  const spaceKey = params[0];
  const allPages = await fetchAllPages(spaceKey);
  printPageDetails(allPages);
};

const handleCheckAccess = async () => {
  await checkAccessibleResources();
};

/**
 * Main function to run the appropriate operation based on command-line arguments.
 */
const main = async () => {
  const { operation, params } = parseArguments();
  switch (operation) {
    case 'fetch':
      await handleFetchOperation(params);
      break;
    case 'update':
      await handleUpdateOperation(params);
      break;
    case 'fetchByUpdateDate':
      await handleFetchByUpdateDateOperation(params);
      break;
    case 'delete':
      await handleDeleteOperation(params);
      break;
    case 'fetchAll':
      await handleFetchAllPagesOperation(params);
      break;
    case 'checkAccess':
      await handleCheckAccess();
      break;
    default:
      console.error(
        'Unknown operation. Please use "fetch", "update", "fetchByUpdateDate", "delete", or "fetchAll".'
      );
      process.exit(1);
  }
};

main().catch((error) => {
  console.error('An error occurred:', error.message);
  process.exit(1);
});
