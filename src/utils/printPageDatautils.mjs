// handles the printing of page data

/**
 * Recursively prints all properties of an object.
 * @param {Object} obj - The object to print.
 * @param {string} [prefix=''] - The prefix for nested properties.
 * @returns {string} - The formatted string of properties.
 */
const printProperties = (obj, prefix = '') => {
  let output = '';
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      output += `${prefix}${key}:\n`;
      output += printProperties(value, `${prefix}  `);
    } else {
      output += `${prefix}${key}: ${value}\n`;
    }
  }
  return output;
};

/**
 * Prints page details including all nested properties.
 * @param {Object} page - The page object to print.
 */
export const printPageDetails = (page) => {
  if (!page || typeof page !== 'object') {
    console.error('Invalid page object');
    return;
  }
  const pageInfo = printProperties(page);
  console.log(pageInfo);
};
