const fs = require('fs');
const fse = require('fs-extra');

const { WDIO_REPORT_FOLDER, ACCEPTANCE_TEST_SRC_FOLDER } = require('./config');
const { cleanString } = require('./utils');

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

const parseWdioReports = () => {
    const allReportsPaths = fs.readdirSync(WDIO_REPORT_FOLDER);
    const allReportsData = reduceReports(allReportsPaths);
    return allReportsData;
};

module.exports = parseWdioReports;