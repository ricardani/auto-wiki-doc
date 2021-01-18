const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const REPORT_FOLDER = 'reports/json';
const ACCEPTANCE_TEST_FOLDER = 'acceptance/tests';
const DOCS_ACCEPTANCE_FOLDER = 'docs/acceptance';
const DOCS_FOLDER = 'docs';

const cleanString = str => str.trim().replace(/[^\S\r\n]+/g, ' ').replace(/\n/g, '<br />');

const reduceTests = tests => tests.map(test => ({
    name: cleanString(test.name)
}));

const reduceSuites = suites => suites.map(suite => ({
    name: cleanString(suite.name),
    tests: reduceTests(suite.tests)
}));

const getSpecsData = specs => {
    const specPath = specs[0].split(`${ACCEPTANCE_TEST_FOLDER}/`).pop().split('/');
    const fileName = specPath.pop();
    return {
        fileName,
        specPath: specPath.join('/')
    };
};

const reduceReports = allReports => allReports.map(reportPath => {
    const reportData = fse.readJsonSync(`${REPORT_FOLDER}/${reportPath}`);

    const suites = reduceSuites(reportData.suites);
    const specs = getSpecsData(reportData.specs);
    const reportName = cleanString(suites[0].name);
    suites.shift();

    return {
        reportName,
        suites,
        specs
    };
});

const getPreConditionContent = filePath => {
    const fileData = fse.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const preConditionInitIndex = fileData.indexOf('Pre-Conditions');
    const preConditionEndIndex = fileData.indexOf('*/', preConditionInitIndex);

    const preConditionData = fileData.substring(preConditionInitIndex, preConditionEndIndex);

    return `\n${cleanString(preConditionData)}\n`;
};

const getTableContent = report => {
    const tableHeader = '| When | Then |\n| ----------- | ----------- |';
    const tableContent = report.suites.map(suite => {
        const whenClause = suite.name;
        const thenClause = suite.tests.map(t => t.name).join('<br /><br />');
        return `| ${whenClause} | ${thenClause} |\n`;
    });

    return [tableHeader, tableContent.join('')].join('\n');
};

const writeMarkdownDoc = reports => reports.map(report => {
    const { specPath, fileName } = report.specs;

    const markdownContent = `# ${report.reportName}`;

    const preConditionContent = getPreConditionContent(`${ACCEPTANCE_TEST_FOLDER}/${specPath}/${fileName}`);

    const tableContent = getTableContent(report);

    fse.outputFileSync(`./${DOCS_ACCEPTANCE_FOLDER}/${specPath}/${report.reportName}.md`, [markdownContent, preConditionContent, tableContent].join('\n'));
});

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

const writeReadMePerModule = (modulePath, tests) => {
    const fileName = `Functional Tests ${modulePath}`;
    const title = `# ${fileName}`

    const testsList = tests.join('<br /><br />');

    fse.outputFileSync(`./${DOCS_ACCEPTANCE_FOLDER}/${modulePath}/${modulePath.split('/').pop()}.md`, [title, testsList].join('\n'));
}

const writeMarkdownReadMe = suitesFolderInfo => {
    const folderKeys = Object.keys(suitesFolderInfo);
    // TODO: Move sort to its own function
    const sortedFolderKeys = folderKeys.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    const fileName = 'Functional Tests';
    const title = `# ${fileName}`;
    
    const tableHeader = '| Module | Tests |\n| ----------- | ----------- |';
    const tableContent = sortedFolderKeys.map(key => {
        const testsData = suitesFolderInfo[key].join('<br /><br />');
        
        writeReadMePerModule(key, suitesFolderInfo[key]);
        // TODO: Format key
        return `| ${key} | ${testsData} |\n`;
    });

    fse.outputFileSync(`./${DOCS_ACCEPTANCE_FOLDER}/acceptance.md`, [title, tableHeader, tableContent.join('')].join('\n'));
};

const writeSidebar = folder => {
    const allDocs = fs.readdirSync(folder);
    allDocs.map(doc => {
        if (fs.lstatSync(path.join(folder, doc)).isDirectory() ) {
            console.log(doc)
            writeSidebar(`${folder}/${doc}`)
        }
    })
    console.log(allDocs)
};

const getDocs = () => {
    const allReportsPaths = fs.readdirSync(REPORT_FOLDER);
    const allReportsData = reduceReports(allReportsPaths);

    const suitesFolderInfo = getSuitesFolderInfo(allReportsData);
    // console.log(suitesFolderInfo);

    // console.log(JSON.stringify(report));
    writeMarkdownDoc(allReportsData);
    writeMarkdownReadMe(suitesFolderInfo);

    writeSidebar(DOCS_FOLDER);
};

getDocs();
