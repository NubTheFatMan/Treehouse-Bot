exports.name = "Text Related";

global.removeFormatting = str => {
    return str.replace(/`+/g, '\\`').replace(/\*+/g, '\\*').replace(/\|+/g, '\\|').replace(/_+/g, '\\_').replace(/~+/g, '\\~').replace(/> /g, '\\> ');
}
exports.removeFormatting = global.removeFormatting;

// typeof converts all types that are derived from Object to "object", disregarding classes
// This will instead get the class name
// Examples:
//      typeof (new Map()) == "object"
//      trueTypeof (newMap()) == "Map"
global.trueTypeof = value => {
    if (value == undefined) // == here captures both "undefined" and "null". Neither of these types have the .__proto__ property
        return String(value);
    return value.__proto__.constructor.name;
}
exports.trueTypeof = global.trueTypeof;