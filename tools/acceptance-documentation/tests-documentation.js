const fse = require('fs-extra');

const { ACCEPTANCE_TEST_SRC_FOLDER, DOCS_ACCEPTANCE_FOLDER } = require('./config');
const { cleanString } = require('./utils');

const getPreConditionContent = filePath => {
    const fileData = fse.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const preConditionInitIndex = fileData.indexOf('Pre-Conditions');
    const preConditionEndIndex = fileData.indexOf('*/', preConditionInitIndex);

    const preConditionData = fileData.substring(preConditionInitIndex, preConditionEndIndex);

    return `\n${cleanString(preConditionData)}\n`;
};

const getTableContent = report => {
    const tableHeader = '| Steps | Expected Results |\n| ----------- | ----------- |';
    const tableContent = report.suites.map(suite => {
        const whenClause = suite.name;
        const thenClause = suite.tests.map(t => t.name).join('<br /><br />');
        return `| ${whenClause} | ${thenClause} |\n`;
    });

    return [tableHeader, tableContent.join('')].join('\n');
};

const generateTestsDocumentation = allReports => allReports.map(report => {
    const { specPath, fileName } = report.specs;

    const markdownContent = `# ${report.reportName}`;

    const preConditionContent = getPreConditionContent(`${ACCEPTANCE_TEST_SRC_FOLDER}/${specPath}/${fileName}`);

    const tableContent = getTableContent(report);

    fse.outputFileSync(`./${DOCS_ACCEPTANCE_FOLDER}/${specPath}/${report.reportName}.md`, [markdownContent, preConditionContent, tableContent].join('\n'));
});

module.exports = generateTestsDocumentation;
