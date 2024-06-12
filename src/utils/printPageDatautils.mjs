// src/utils/printPageDataUtils.mjs

/**
 * Prints the page ID.
 * @param {Object} page - The page object.
 * @returns {string} The formatted page ID string.
 */
const printPageId = (page) => `ID: ${page.id}\n`;

/**
 * Prints the page type.
 * @param {Object} page - The page object.
 * @returns {string} The formatted page type string.
 */
const printPageType = (page) => `Type: ${page.type}\n`;

/**
 * Prints the page status.
 * @param {Object} page - The page object.
 * @returns {string} The formatted page status string.
 */
const printPageStatus = (page) => `Status: ${page.status}\n`;

/**
 * Prints the page title.
 * @param {Object} page - The page object.
 * @returns {string} The formatted page title string.
 */
const printPageTitle = (page) => `Title: ${page.title}\n`;

/**
 * Prints the page version.
 * @param {Object} page - The page object.
 * @returns {string} The formatted page version string.
 */
const printPageVersion = (page) =>
  page.version ? `Version: ${page.version.number}\n` : '';

/**
 * Prints the page metadata.
 * @param {Object} page - The page object.
 * @returns {string} The formatted page metadata string.
 */
const printPageMetadata = (page) =>
  page.metadata ? `Metadata: ${JSON.stringify(page.metadata)}\n` : '';

/**
 * Prints the expandable fields.
 * @param {Object} page - The page object.
 * @returns {string} The formatted expandable fields string.
 */
const printExpandableFields = (page) =>
  page._expandable ? `Expandable: ${JSON.stringify(page._expandable)}\n` : '';

/**
 * Prints page details.
 * @param {Array} pages - The pages to print.
 */
export const printPages = (pages) => {
  let output = `Fetched ${pages.length} pages:\n`;
  pages.forEach((page, index) => {
    output += `Page ${index + 1}:\n`;
    output += printPageId(page);
    output += printPageType(page);
    output += printPageStatus(page);
    output += printPageTitle(page);
    output += printPageVersion(page);
    output += printPageMetadata(page);
    output += printExpandableFields(page);
    output += '---\n';
  });
  console.log(output);
};
