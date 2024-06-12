import { fetchPageById } from './services/fetchPageById.mjs';
import { updatePageById } from './services/updatePageById.mjs';
import { fetchByUpDate } from './services/fetchByUpDate.mjs';
import { deletePageById } from './services/deletePageById.mjs';
import { fetchAllPages } from './services/fetchAllPages.mjs';
import { printPages } from '../utils/printPageDatautils.mjs';

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
  console.log('Handling fetch operation with params:', params);
  const [pageId] = params;
  if (!pageId) {
    console.error('Please provide a page ID for the fetch operation.');
    process.exit(1);
  }
  const page = await fetchPageById(pageId);
  printPages([page]);
};

/**
 * Handles the update operation.
 * @param {Array} params - The parameters for the update operation.
 */
const handleUpdateOperation = async (params) => {
  console.log('Handling update operation with params:', params);
  const [pageId, title, bodyContent] = params;
  if (!pageId || !title || !bodyContent) {
    console.error(
      'Please provide page ID, title, and body content for the update operation.'
    );
    process.exit(1);
  }
  await updatePageById(pageId, title, bodyContent);
};

/**
 * Handles the fetch by update date operation.
 * @param {Array} params - The parameters for the fetch by update date operation.
 */
const handleFetchByUpdateDateOperation = async (params) => {
  console.log('Handling fetch by update date operation with params:', params);
  const [updateDate] = params;
  if (!updateDate) {
    console.error(
      'Please provide an update date for the fetch by update date operation (YYYY-MM-DD).'
    );
    process.exit(1);
  }
  const pageUpDated = await fetchByUpDate(updateDate);
  printPages(pageUpDated);
};

/**
 * Handles the delete operation.
 * @param {Array} params - The parameters for the delete operation.
 */
const handleDeleteOperation = async (params) => {
  console.log('Handling delete operation with params:', params);
  const [pageId] = params;
  if (!pageId) {
    process.exit(1);
  }
  await deletePageById(pageId);
};

/**
 * Handles the fetch all pages operation with pagination.
 * @param {Array} params - The parameters for the fetch all pages operation.
 */
const handleFetchAllPagesOperation = async (params) => {
  const spaceKey = params[0];
  const allPages = await fetchAllPages(spaceKey);
  printPages(allPages);
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

// build test cases for the following functions, end to end and unit tests
