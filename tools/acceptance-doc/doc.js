const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const ACCEPTANCE_TEST_SRC_FOLDER = 'acceptance/tests';
const WDIO_REPORT_FOLDER = 'reports/json';
const DOCS_ACCEPTANCE_FOLDER = 'docs/Acceptance Tests';
const DOCS_FOLDER = 'docs';
const WIKI_URL = 'https://github.com/ricardani/auto-wiki-doc/wiki';

const cleanString = str => str.trim().replace(/[^\S\r\n]+/g, ' ').replace(/\n/g, '<br />');

const reduceTests = tests => tests.map(test => ({
    name: cleanString(test.name)
}));

const reduceSuites = suites => suites.map(suite => ({
    name: cleanString(suite.name),
    tests: reduceTests(suite.tests)
}));

const getSpecsData = specs => {
    const specPath = specs[0].split(`${ACCEPTANCE_TEST_SRC_FOLDER}/`).pop().split('/');
    const fileName = specPath.pop();
    return {
        fileName,
        specPath: specPath.join('/')
    };
};

const reduceReports = allReports => allReports.map(reportPath => {
    const reportData = fse.readJsonSync(`${WDIO_REPORT_FOLDER}/${reportPath}`);

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
    const tableHeader = '| Steps | Expected Results |\n| ----------- | ----------- |';
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

    const preConditionContent = getPreConditionContent(`${ACCEPTANCE_TEST_SRC_FOLDER}/${specPath}/${fileName}`);

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

const writeFunctionalTestsIndex = suitesFolderInfo => {
    const folderKeys = Object.keys(suitesFolderInfo);
    // TODO: Move sort to its own function
    const sortedFolderKeys = folderKeys.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    const title = `# Index`;
    
    const tableHeader = '| Module | Tests |\n| ----------- | ----------- |';
    const tableContent = sortedFolderKeys.map(key => {
        const testsData = suitesFolderInfo[key].join('<br /><br />');
        
        // TODO: Format key
        return `| ${key} | ${testsData} |\n`;
    });

    fse.outputFileSync(`./${DOCS_ACCEPTANCE_FOLDER}/Index.md`, [title, tableHeader, tableContent.join('')].join('\n'));
};

const getSidebarContent = (folder) => {
    const allDocs = fs.readdirSync(folder);
    const content = {
        files: [],
        children: {}
    };
    allDocs.map(doc => {
         if (!fs.lstatSync(path.join(folder, doc)).isDirectory() ) {
                content.files.push(doc);
        } else {
            const childrenContent = getSidebarContent(`${folder}/${doc}`);
            content.children[doc] = childrenContent;
        }
    })
    return content;
};

const addIndentation = (str, indentation) => {
    let strWithIndentation = '';
    for (let i = 0; i < indentation; i++) {
        strWithIndentation += '\t'
    }
    strWithIndentation += str;

    return strWithIndentation;
}

const getSidebarText = (content, key, indentation = 0) => {
    const sidebarText = [];
    let newIndentation = indentation;
    if (key) {
        sidebarText.push(addIndentation(`* ${key}`, indentation));
        newIndentation++;
    }

    content.files.forEach(file => {
        const fileName = file.split('.');
        fileName.pop();
        const fileNameWithoutExtension = fileName.join('.');
        const fileNameForWiki = fileNameWithoutExtension.replace(/[^\S\r\n]/g, '-');
        sidebarText.push(addIndentation(`* [${fileNameWithoutExtension}](${WIKI_URL}/${fileNameForWiki})`, newIndentation));
    })

    const childrenKeys = Object.keys(content.children);
    if (childrenKeys.length > 0) {
        childrenKeys.forEach(childKey => {
            const childText = getSidebarText(content.children[childKey], childKey, newIndentation)
            sidebarText.push(childText);
        })
    }

    return sidebarText.join('\n');
}

const writeSidebar = sidebarContent => {
    const sidebarText = getSidebarText(sidebarContent);
    fse.outputFileSync(`./${DOCS_FOLDER}/_Sidebar.md`, sidebarText);
};

const getDocs = () => {
    const allReportsPaths = fs.readdirSync(WDIO_REPORT_FOLDER);
    const allReportsData = reduceReports(allReportsPaths);

    const suitesFolderInfo = getSuitesFolderInfo(allReportsData);

    writeMarkdownDoc(allReportsData);
    writeFunctionalTestsIndex(suitesFolderInfo);

    const sidebarContent = getSidebarContent(DOCS_FOLDER);
    writeSidebar(sidebarContent);
};

getDocs();
