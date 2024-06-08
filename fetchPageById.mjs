import { makeApiRequest } from './utils/request.mjs';

// TODO:handle this dynamically
const pageId = '917509'; // Replace with the actual page ID

const fetchPageById = async () => {
  const path = `/wiki/rest/api/content/${pageId}`;
  try {
    const response = await makeApiRequest(path);
    console.log('Fetched page:', response);
  } catch (error) {
    console.error('Error fetching page:', error.message);
  }
};

// Run the function
fetchPageById();
