# Atlassian Confluence API Integration

This project provides a set of Node.js scripts to interact with the Atlassian Confluence API. It allows you to fetch, update, and delete pages using the Confluence REST API. Additionally, it supports pagination for fetching all pages and filtering pages by update date.

## Prerequisites

- Node.js installed on your system. You can download it from the [official Node.js website](https://nodejs.org/).
- A Confluence account with API access.
- The necessary credentials and configuration settings saved in a `.env` file.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/confluence-api-integration.git
   cd AtlassianConfluence
   ```

2. **Create a `.env` file in the root directory of the project and add the following variables:**

   ```bash
   PORT=3000
   SPACE_KEY=APPINT
   BASE_URL=https://your_url.atlassian.net
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_secret_key
   AUTHORIZATION_URL=https://auth.atlassian.com/authorize
   TOKEN_URL=https://auth.atlassian.com/oauth/token
   REDIRECT_URI=http://localhost:your_port/oauth/callback
   USERNAME=your_username@gmail.com
   TOKEN_EXPIRATION_TIME=null
   CLOUD_ID=null
   ACCESS_TOKEN=null
   REFRESH_TOKEN=null
   DEFAULT_EXPAND=version
   ```

   Make sure to replace the values with your actual Confluence API credentials.
   Use DEFAULT_EXPAND=version as defult and add more as require.
   Read more info : https://confluence.atlassian.com/confkb/oauth-2-0-configuration-for-confluence-1224638905.html

## Usage

You can use the following commands to interact with the Confluence API:

**Fetch a Page by ID**

```bash
node src/index.mjs fetch <pageId>
```

**Update a Page by ID**

```bash
node src/index.mjs update <pageId> <title> <bodyContent>
```

**Fetch Pages Updated After a Specific Date**

```bash
node src/index.mjs fetchByUpdateDate <updateDate>
```

**Delete a Page by ID**

```bash
node src/index.mjs delete <pageId>
```

**Fetch All Pages with Pagination**

```bash
node src/index.mjs fetchAll
```

##

### MIT License

````text
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

````
