const cleanString = str => str.trim().replace(/[^\S\r\n]+/g, ' ').replace(/\n/g, '<br />');

const addIndentation = (str, indentation) => {
    let strWithIndentation = '';
    for (let i = 0; i < indentation; i++) {
        strWithIndentation += '\t';
    }
    strWithIndentation += str;

    return strWithIndentation;
};

module.exports = {
    cleanString,
    addIndentation
};
