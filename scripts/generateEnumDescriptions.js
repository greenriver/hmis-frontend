'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('graphql.schema.json');
let schema = JSON.parse(rawdata);

let output = '\n';

const ENUM_SECTION_DELIM = '__';
const DESCRIPTION_DELIM = ' – ';

schema.__schema.types.forEach((type) => {
  if (type.kind === 'ENUM' && !type.name.startsWith('__')) {
    const values = [];
    type.enumValues.forEach((elem) => {
      if (elem.description) {
        let description = elem.description.replaceAll(/\n/g, ' ');
        if (
          elem.name.includes(ENUM_SECTION_DELIM) &&
          description.includes(DESCRIPTION_DELIM)
        ) {
          description = description
            .substring(description.search(/(\s–\s)\([0-9]*\)/s))
            .replace(/^\s–\s/, '');
        }
        values.push(`${elem.name}: "${description}"`);
      }
    });
    if (values.length) {
      output += `export const ${type.name}Enum = {${values.join(',')}};\n`;
    }
  }
});

const filename = 'src/types/gqlEnums.ts';
fs.writeFile(filename, output, (err) => {
  if (err) return console.log(err);
  console.log(filename);
});
