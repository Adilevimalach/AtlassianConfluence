import https from 'https';

const email = 'adilevimalach@gmail.com';
const apiToken =
  'ATATT3xFfGF0TNsctHYmxmSTakAx5S7EOD9fB9-fSqULIzVbGxPcy25O97l5MTz4kSg0eW3d3gh33xmDhOHqHa-_UfrtUvk_CHnqC-Ui6yzhZ9e-ojx5YeOGjnlkO5-stvAvf-kSronkbczT7zwqMYnTE9oMPSlpRMoQCuXEzUxQ3pdxOYbAhlI=5AE0C5BD';
const baseURL = 'https://adilevimalach.atlassian.net';
const path = '/wiki/api/v2/pages';

/**
 * Fetches all pages from a Confluence API.
 */
const fetchPages = () => {
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

  /**
   * receives the chunks of data from the API call, parses the JSON data, and logs the fetched pages to the console.
   */

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Response: ${res.statusCode} ${res.statusMessage}`);
      console.log('Response Headers:', res.headers);
      if (res.statusCode === 200) {
        const jsonResponse = JSON.parse(data);
        console.log('Fetched Pages:', jsonResponse.results);
        jsonResponse.results.forEach((page) => {
          console.log(`\nPage ID: ${page.id}`);
          console.log(`Title: ${page.title}`);
          console.log(`URL: ${page._links.self}`);
        });
      } else {
        console.error('Error:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

// Run the function
fetchPages();
