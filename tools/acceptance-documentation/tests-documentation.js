const fse = require('fs-extra');

const { ACCEPTANCE_TEST_SRC_FOLDER, DOCS_ACCEPTANCE_FOLDER } = require('./config');
const { cleanString, replaceSpaceWithDash, replaceSlashWithDash, toPascalCase } = require('./utils');

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
    const dashedSpecPath = replaceSpaceWithDash(specPath);

    const specPathForTitle = toPascalCase(replaceSlashWithDash(dashedSpecPath));
    const testTitle = `# ${specPathForTitle} ${report.reportName}`;

    const preConditionContent = getPreConditionContent(`${ACCEPTANCE_TEST_SRC_FOLDER}/${specPath}/${fileName}`);

    const tableContent = getTableContent(report);

    const fileContent = [testTitle, preConditionContent, tableContent].join('\n');

    const dashedFileName = replaceSpaceWithDash(report.reportName);
    const wikiFileName = `${replaceSlashWithDash(dashedSpecPath)}-${dashedFileName}`;

    fse.outputFileSync(`./${DOCS_ACCEPTANCE_FOLDER}/${dashedSpecPath}/${wikiFileName}.md`, fileContent);
});

module.exports = generateTestsDocumentation;
