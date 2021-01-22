const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const {
    DOCS_FOLDER,
    WIKI_URL
} = require('./config');
const { addIndentation, replaceSpaceWithDash, replaceDashWithSpace } = require('./utils');

const getSidebarContent = folder => {
    const allDocs = fs.readdirSync(folder);
    const content = {
        files: [],
        children: {}
    };
    allDocs.map(doc => {
        if (!fs.lstatSync(path.join(folder, doc)).isDirectory()) {
            content.files.push(doc);
        } else {
            const childrenContent = getSidebarContent(`${folder}/${doc}`);
            content.children[doc] = childrenContent;
        }
    });
    return content;
};

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
        const fileNameForWiki = replaceSpaceWithDash(fileNameWithoutExtension);
        const fileNameTag = replaceDashWithSpace(fileNameWithoutExtension.split('__').pop());

        sidebarText.push(addIndentation(`* [${fileNameTag}](${WIKI_URL}/${fileNameForWiki})`, newIndentation));
    });

    const childrenKeys = Object.keys(content.children);
    if (childrenKeys.length > 0) {
        childrenKeys.forEach(childKey => {
            const childText = getSidebarText(content.children[childKey], childKey, newIndentation);
            sidebarText.push(childText);
        });
    }

    return sidebarText.join('\n');
};

const writeSidebar = sidebarContent => {
    const sidebarText = getSidebarText(sidebarContent);
    fse.outputFileSync(`./${DOCS_FOLDER}/_Sidebar.md`, sidebarText);
};

const generateSidebar = () => {
    const sidebarContent = getSidebarContent(DOCS_FOLDER);
    writeSidebar(sidebarContent);
};

module.exports = generateSidebar;
