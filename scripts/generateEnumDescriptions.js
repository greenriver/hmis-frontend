'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('graphql.schema.json');
let schema = JSON.parse(rawdata);

let output = 'export const HmisEnums = {';

// const ENUM_SECTION_DELIM = '__';
// const DESCRIPTION_DELIM = ' – ';

const CODE_PATTERN_NUMERIC = /^\(([0-9]*)\) /;
const CODE_PATTERN = /^\(([a-zA-Z0-9]*)\) /;

const CUSTOM_SORT_VALUES = {
  FundingSource: {
    LOCAL_OR_OTHER_FUNDING_SOURCE: 499,
    N_A: 500,
  },
  ProjectType: {
    OTHER: 500,
  },
};

// Get numeric sort value from enum value
const getSortValue = (elem, name) => {
  const custom = CUSTOM_SORT_VALUES[name] || {};

  // 9 from "(9) Client refused"
  const m = elem.description.match(CODE_PATTERN_NUMERIC);

  if (m && m[1]) {
    const num = parseInt(m[1]);
    // Always put DNC/REFUSED/DK at the end
    if (num === 99) return 500;
    if (num === 9) return 499;
    if (num === 8) return 498;

    // Other fields with custom sort values
    if (custom[elem.name]) {
      return custom[elem.name];
    }

    // By default, sort by HUD number if it exists
    return num;
  }

  return custom[elem.name] || null;
};

schema.__schema.types.forEach((type) => {
  if (type.kind === 'ENUM' && !type.name.startsWith('__')) {
    // sort by descriptions since they are prefixed with (1) etc
    // we might want to drop that from some, like race/gender
    const enumValues = type.enumValues
      .filter((a) => !!a.description)
      .sort((a, b) => {
        const first = getSortValue(a, type.name);
        const second = getSortValue(b, type.name);
        if (first !== null && second !== null) return first - second;
        if (first === null && second === null) return 1;
        if (first !== null) return 1;
        if (second !== null) return -1;
        return 0;
      });

    const values = enumValues.map((elem) => {
      let description = elem.description.replaceAll(/\n/g, ' ');
      // if (enumValues.length < 15) {
      description = description.replace(CODE_PATTERN, '');
      // }
      return `${elem.name}: "${description}"`;
    });

    if (values.length) {
      output += `${type.name}: {${values.join(',')}},\n`;
    }
  }
});

output += '}';

const filename = 'src/types/gqlEnums.ts';
fs.writeFile(filename, output, (err) => {
  if (err) return console.log(err);
  console.log(filename);
});
