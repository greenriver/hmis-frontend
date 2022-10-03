'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('graphql.schema.json');
let schema = JSON.parse(rawdata);

let output = 'export const HmisEnums = {';

// const ENUM_SECTION_DELIM = '__';
// const DESCRIPTION_DELIM = ' – ';

const CODE_PATTERN_NUMERIC = /^\(([0-9]*)\) /;
const CODE_PATTERN = /^\(([a-zA-Z0-9]*)\) /;

// Get 9 from "(9) Client refused"
const getNumber = (elem) => {
  const m = elem.description.match(CODE_PATTERN_NUMERIC);
  if (m && m[1]) {
    return parseInt(m[1]);
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
        const first = getNumber(a);
        const second = getNumber(b);
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
