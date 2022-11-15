'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('graphql.schema.json');
let schema = JSON.parse(rawdata);

let output = 'export const HmisEnums = {';

// const ENUM_SECTION_DELIM = '__';
// const DESCRIPTION_DELIM = ' – ';

const CODE_PATTERN_NUMERIC = /^\(([0-9]*)\) /;
const CODE_PATTERN = /^\(([a-zA-Z0-9]*)\) /;

const ALPHABETICAL = ['FundingSource', 'ServiceSubTypeProvided'];

const SORT_LAST = {
  FundingSource: ['LOCAL_OR_OTHER_FUNDING_SOURCE', 'N_A'],
  ProjectType: ['OTHER'],
};

const SORT_FIRST = {
  ResidencePriorLengthOfStay: ['TWO_TO_SIX_NIGHTS', 'ONE_NIGHT_OR_LESS'],
  NoYesReasonsForMissingData: ['YES'],
};

const alphabeticalCompare = (first, second) => {
  const m = first.description.match(CODE_PATTERN_NUMERIC);
  const m2 = second.description.match(CODE_PATTERN_NUMERIC);
  if (m && m2) {
    const description1 = first.description.replace(m[0], '');
    const description2 = second.description.replace(m2[0], '');
    // console.log(description1, description2)
    return description1.localeCompare(description2);
  }

  return first.description.localeCompare(second.description);
};

// Get numeric sort value from enum value
const getSortValue = (elem, name) => {
  // const custom = CUSTOM_SORT_VALUES[name] || {};

  // 9 from "(9) Client refused"
  const m = elem.description.match(CODE_PATTERN_NUMERIC);

  if (m && m[1]) {
    const num = parseInt(m[1]);
    // Always put DNC/REFUSED/DK at the end
    if (num === 99) return 500;
    if (num === 9) return 499;
    if (num === 8) return 498;

    // Other fields with custom sort values
    // if (custom[elem.name]) {
    //   return custom[elem.name];
    // }

    // By default, sort by HUD number if it exists
    return num;
  }

  return null;
};

schema.__schema.types.forEach((type) => {
  if (type.kind === 'ENUM' && !type.name.startsWith('__')) {
    // sort by descriptions since they are prefixed with (1) etc
    // we might want to drop that from some, like race/gender
    const enumValues = type.enumValues
      .filter((a) => !!a.description)
      .sort((a, b) => {
        if (ALPHABETICAL.includes(type.name)) {
          return alphabeticalCompare(a, b);
        }
        const first = getSortValue(a, type.name);
        const second = getSortValue(b, type.name);
        if (first !== null && second !== null) return first - second;
        if (first === null && second === null) return 1;
        if (first !== null) return 1;
        if (second !== null) return -1;
        return 0;
      });

    if (SORT_LAST[type.name]) {
      SORT_LAST[type.name].forEach((name) => {
        const idx = enumValues.findIndex((item) => item.name === name);
        if (idx !== -1) enumValues.push(enumValues.splice(idx, 1)[0]);
      });
    }
    if (SORT_FIRST[type.name]) {
      SORT_FIRST[type.name].forEach((name) => {
        const idx = enumValues.findIndex((item) => item.name === name);
        if (idx !== -1) enumValues.unshift(enumValues.splice(idx, 1)[0]);
      });
    }

    ['CLIENT_REFUSED', 'CLIENT_DOESN_T_KNOW', 'DATA_NOT_COLLECTED'].forEach(
      (name) => {
        const idx = enumValues.findIndex((item) => item.name === name);
        if (idx !== -1) enumValues.push(enumValues.splice(idx, 1)[0]);
      }
    );

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
