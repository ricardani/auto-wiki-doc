const parseWdioReports = require('./reports-parser');
const generateTestsDocumentation = require('./tests-documentation');
const generateTableOfContents = require('./table-of-contents');
const generateSidebar = require('./sidebar');

(() => {
    const allReports = parseWdioReports();

    generateTableOfContents(allReports);
    generateTestsDocumentation(allReports);
    generateSidebar();
})();
