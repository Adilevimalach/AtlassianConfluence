/**
 * Prints page details.
 * @param {Array} pages - The pages to print.
 */
export const printPages = (pages) => {
  let output = `Fetched ${pages.length} pages:\n`;
  pages.forEach((page, index) => {
    output += `Page ${index + 1}:\n`;
    output += `ID: ${page.id}\n`;
    output += `Type: ${page.type}\n`;
    output += `Status: ${page.status}\n`;
    output += `Title: ${page.title}\n`;
    output += '---\n';
  });
  console.log(output);
};
