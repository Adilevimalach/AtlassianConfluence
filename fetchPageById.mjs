import https from 'https';
import { URL } from 'url';

const email = 'adilevimalach@gmail.com';
const apiToken =
  'ATATT3xFfGF0TNsctHYmxmSTakAx5S7EOD9fB9-fSqULIzVbGxPcy25O97l5MTz4kSg0eW3d3gh33xmDhOHqHa-_UfrtUvk_CHnqC-Ui6yzhZ9e-ojx5YeOGjnlkO5-stvAvf-kSronkbczT7zwqMYnTE9oMPSlpRMoQCuXEzUxQ3pdxOYbAhlI=5AE0C5BD';
const baseURL = 'https://adilevimalach.atlassian.net';
const pageId = '884740'; // Replace with the actual page ID you want to fetch
const path = `/wiki/api/v2/pages/${pageId}`;

const fetchPageById = () => {
  const options = {
    hostname: new URL(baseURL).hostname,
    path,
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString(
        'base64'
      )}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Response: ${res.statusCode} ${res.statusMessage}`);
      console.log('Response Headers:', res.headers);
      try {
        const jsonResponse = JSON.parse(data);
        console.log('Response Body:', jsonResponse);
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

// Run the function
fetchPageById();
