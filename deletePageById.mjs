import { makeApiRequest } from './utils/request.mjs';

const deletePageById = async (id) => {
  try {
    const response = await makeApiRequest(`/wiki/api/v2/pages/${id}`, 'DELETE');
    console.log('Deleted page response:', response);
  } catch (error) {
    console.error('Error deleting page:', error.message);
  }
};

// Get the page ID from command line arguments
const args = process.argv.slice(2);
const pageId = args[0];

if (!pageId) {
  console.error('Please provide a page ID as an argument');
  process.exit(1);
}

// Call the delete function with the provided page ID
deletePageById(pageId);
