'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('graphql.schema.json');
let schema = JSON.parse(rawdata);

let output = '\n';

schema.__schema.types.forEach((type) => {
  if (type.kind === 'ENUM' && !type.name.startsWith('__')) {
    const values = [];
    type.enumValues.forEach((elem) => {
      if (elem.description) {
        values.push(
          `${elem.name}: "${elem.description.replaceAll(/\n/g, '')}"`
        );
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
