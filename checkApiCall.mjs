import https from 'https';

const apiToken =
  'ATATT3xFfGF0TNsctHYmxmSTakAx5S7EOD9fB9-fSqULIzVbGxPcy25O97l5MTz4kSg0eW3d3gh33xmDhOHqHa-_UfrtUvk_CHnqC-Ui6yzhZ9e-ojx5YeOGjnlkO5-stvAvf-kSronkbczT7zwqMYnTE9oMPSlpRMoQCuXEzUxQ3pdxOYbAhlI=5AE0C5BD';
const email = 'adilevimalach@gmail.com';
const baseURL = 'https://adilevimalach.atlassian.net';
const path = '/wiki/rest/api/content?type=page&expand=history&limit=10';

/**
 * Makes an API call to the specified URL with the provided options.
 * @function checkApiCall
 */
const checkApiCall = () => {
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
   * sets up a HTTP request using the https.request() function, handles the response by listening to events emitted by the response object, and logs the response data and status to the console.
   */

  /**
   * Represents the HTTP request object.
   *
   * @type {import('http').ClientRequest}
   */
  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response Headers:', res.headers);
      console.log('Response Body:', data);

      if (res.statusCode === 200) {
        console.log('API call successful');
      } else {
        console.error(`API call failed with status code: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

// Run the function
checkApiCall();
