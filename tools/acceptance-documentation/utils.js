const cleanString = str => str.trim().replace(/[^\S\r\n]+/g, ' ').replace(/\n/g, '<br />');

const addIndentation = (str, indentation) => {
    let strWithIndentation = '';
    for (let i = 0; i < indentation; i++) {
        strWithIndentation += '\t';
    }
    strWithIndentation += str;

    return strWithIndentation;
};

const replaceSpaceWithDash = str => str.replace(/[^\S\r\n]/g, '-');

const replaceSlashWithUnderscore = str => str.replace(/\//g, '__');

const replaceSlashWithDash = str => str.replace(/\//g, '-');

const replaceDashWithSpace = str => str.replace(/-/g, ' ');

const toPascalCase = str => str.replace(/(^\w|-\w)/g, group => group.replace(/-/, ' ').toUpperCase());


module.exports = {
    cleanString,
    addIndentation,
    replaceSpaceWithDash,
    replaceSlashWithUnderscore,
    replaceSlashWithDash,
    replaceDashWithSpace,
    toPascalCase
};
