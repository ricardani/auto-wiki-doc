const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const { DOCS_FOLDER, IMAGE_LOCAL_PATH, IMAGE_GITHUB_MASTER_PATH } = require('./config');

const getAllDocumentationPaths = (folder = DOCS_FOLDER) => {
    const allDocs = fs.readdirSync(folder);
    const paths = [];

    allDocs.forEach(doc => {
        if (!fs.lstatSync(path.join(folder, doc)).isDirectory()) {
            paths.push(`${folder}/${doc}`);
        } else {
            const childrenContent = getAllDocumentationPaths(`${folder}/${doc}`);
            paths.push(...childrenContent);
        }
    });

    return paths;
}

const addGitHubPathToImages = () => {
    const allDocsPaths = getAllDocumentationPaths();

    allDocsPaths.forEach(docPath => {
        const data = fse.readFileSync(docPath, { encoding: 'utf8', flag: 'r' });

        const newData = data.replace(IMAGE_LOCAL_PATH, IMAGE_GITHUB_MASTER_PATH);

        fse.outputFileSync(docPath, newData);
    })
};

module.exports = addGitHubPathToImages;