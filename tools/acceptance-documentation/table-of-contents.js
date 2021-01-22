const fse = require('fs-extra');

const { DOCS_ACCEPTANCE_FOLDER } = require('./config');

const getSuitesFolderInfo = reports => {
    const suitesFolderInfo = {};
    reports.map(report => {
        const { specPath } = report.specs;

        if (suitesFolderInfo[specPath]) {
            suitesFolderInfo[specPath].push(report.reportName);
        } else {
            suitesFolderInfo[specPath] = [report.reportName];
        }
    });
    return suitesFolderInfo;
};

const writeTableOfContents = suitesFolderInfo => {
    const folderKeys = Object.keys(suitesFolderInfo);
    const sortedFolderKeys = folderKeys.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    const title = '# Table Of Contents';

    const tableHeader = '| Module | Tests |\n| ----------- | ----------- |';
    const tableContent = sortedFolderKeys.map(key => {
        const testsData = suitesFolderInfo[key].join('<br /><br />');

        return `| ${key} | ${testsData} |\n`;
    });

    fse.outputFileSync(`./${DOCS_ACCEPTANCE_FOLDER}/table-of-contents.md`, [title, tableHeader, tableContent.join('')].join('\n'));
};

const generateTableOfContents = allReports => {
    const suitesFolderInfo = getSuitesFolderInfo(allReports);
    writeTableOfContents(suitesFolderInfo);
};

module.exports = generateTableOfContents;
