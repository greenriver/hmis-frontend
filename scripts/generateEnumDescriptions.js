'use strict';

const fs = require('fs');
const { type } = require('os');
const generatedFiledHeader =
  '// **** THIS FILE IS GENERATED, DO NOT EDIT DIRECTLY ****\n\n';
let rawdata = fs.readFileSync('graphql.schema.json');
let schema = JSON.parse(rawdata);

let output = `${generatedFiledHeader}\nexport const HmisEnums = {`;

// const ENUM_SECTION_DELIM = '__';
// const DESCRIPTION_DELIM = ' – ';

const CODE_PATTERN_NUMERIC = /^\(([0-9]*)\) /;
const CODE_PATTERN = /^\(([a-zA-Z0-9_]*)\) /;

const ALPHABETICAL = ['FundingSource', 'ServiceSubTypeProvided', 'AgeRange'];

const SORT_LAST = {
  FundingSource: ['LOCAL_OR_OTHER_FUNDING_SOURCE', 'N_A'],
  ProjectType: ['OTHER'],
};

const SORT_FIRST = {
  ResidencePriorLengthOfStay: ['TWO_TO_SIX_NIGHTS', 'ONE_NIGHT_OR_LESS'],
  NoYesReasonsForMissingData: ['YES'],
  EnrollmentFilterOptionStatus: ['INCOMPLETE'],
  AgeRange: ['Ages5to12', 'Under5'],
};

const DESCRIPTIONS_OVERRIDES = {
  DOBDataQuality: {
    APPROXIMATE_OR_PARTIAL_DOB_REPORTED: 'Partial DOB',
    FULL_DOB_REPORTED: 'Full DOB',
  },
  SSNDataQuality: {
    APPROXIMATE_OR_PARTIAL_SSN_REPORTED: 'Partial SSN',
    FULL_SSN_REPORTED: 'Full SSN',
  },
  NameDataQuality: {
    FULL_NAME_REPORTED: 'Full name',
    PARTIAL_STREET_NAME_OR_CODE_NAME_REPORTED:
      'Partial, street name, or code name',
  },
  RelationshipToHoH: {
    SELF_HEAD_OF_HOUSEHOLD: 'Self (HoH)',
  },
};

const POSITION_MAPS = {
  ClientSortOption: [
    (desc) => desc.match(/^First Name/),
    (desc) => desc.match(/^Last Name/),
    (desc) => desc.match(/^Age/),
  ],
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

const positionCompare = (first, second, positionMap) => {
  const n1 = positionMap.findIndex((f) => f(first.description));
  const n2 = positionMap.findIndex((f) => f(second.description));

  if (n1 > n2) return 1;
  if (n1 < n2) return -1;
  return alphabeticalCompare(first, second);
};

// Get numeric sort value from enum value
const getSortValue = (elem, name) => {
  // 9 from "(9) Client refused"
  const m = elem.description.match(CODE_PATTERN_NUMERIC);

  if (m && m[1]) {
    const num = parseInt(m[1]);
    // Always put DNC/REFUSED/DK at the end
    if (num === 99) return 500;
    if (num === 9) return 499;
    if (num === 8) return 498;
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
      // .filter((a) => !!a.description)
      .map((val) => ({
        ...val,
        description:
          DESCRIPTIONS_OVERRIDES[type]?.[val.name] || val.description,
      }))
      .sort((a, b) => {
        if (!a.description || !b.description) return 1;

        if (ALPHABETICAL.includes(type.name)) {
          return alphabeticalCompare(a, b);
        }
        if (type.name in POSITION_MAPS)
          return positionCompare(a, b, POSITION_MAPS[type.name]);
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

    // Always first
    ['YES'].forEach((name) => {
      const idx = enumValues.findIndex((item) => item.name === name);
      if (idx !== -1) enumValues.unshift(enumValues.splice(idx, 1)[0]);
    });

    // Always last
    [
      'CLIENT_PREFERS_NOT_TO_ANSWER',
      'CLIENT_DOESN_T_KNOW',
      'DATA_NOT_COLLECTED',
    ].forEach((name) => {
      const idx = enumValues.findIndex((item) => item.name === name);
      if (idx !== -1) enumValues.push(enumValues.splice(idx, 1)[0]);
    });

    const values = enumValues.map((elem) => {
      let description = elem.description?.replaceAll(/\n/g, ' ') || elem.name;
      description = description.replace(CODE_PATTERN, '');
      if (DESCRIPTIONS_OVERRIDES[type.name]?.[elem.name]) {
        description = DESCRIPTIONS_OVERRIDES[type.name]?.[elem.name];
      }
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
  // eslint-disable-next-line no-console
  if (err) return console.log(err);
  // eslint-disable-next-line no-console
  console.log(filename);
});

const inputObjectSchemas = schema.__schema.types
  .filter((o) => o.kind === 'INPUT_OBJECT' && !o.name.startsWith('__'))
  .map(({ name, inputFields }) => {
    const args = inputFields
      .filter((f) => f.name !== 'clientMutationId')
      .map(({ name, type }) => ({ name, type }));
    return { name, args };
  });

const objectSchemas = schema.__schema.types
  .filter(
    (o) =>
      o.kind === 'OBJECT' &&
      !o.name.endsWith('Payload') &&
      !o.name.endsWith('Payload') &&
      !o.name.endsWith('Paginated') &&
      !o.name.endsWith('Input') &&
      !o.name.startsWith('__') &&
      !['Mutation', 'Query'].includes(o.name)
    // !o.type?.ofType?.kind === 'OBJECT'
  )
  .map(({ name, fields }) => {
    fields = fields
      .filter((f) => f.type?.kind !== 'OBJECT')
      .filter((f) => f.type?.ofType?.kind !== 'OBJECT')
      .filter((f) => f.type?.ofType?.ofType?.kind !== 'OBJECT')
      .filter((f) => f.type?.ofType?.ofType?.ofType?.kind !== 'OBJECT')
      .map(({ name, type }) => ({ name, type }));
    return { name, fields };
  });

const schemaOutput = `
${generatedFiledHeader}
import { HmisEnums } from './gqlEnums';
import { Scalars } from './gqlTypes';

export interface GqlSchemaType {
  kind: 'NON_NULL' | 'LIST' | 'SCALAR' | 'OBJECT' | 'ENUM' | 'UNION';
  name: keyof Scalars | keyof typeof HmisEnums | 'OmnisearchResult' | null;
  ofType: GqlSchemaType | null;
}

export interface GqlSchemaField {
  name: string;
  type: GqlSchemaType;
}
export interface GqlSchema {
  name: string;
  fields: GqlSchemaField[];
}

export interface GqlInputObjectSchemaType {
  kind: 'NON_NULL' | 'LIST' | 'SCALAR' | 'ENUM' | 'INPUT_OBJECT';
  name: string | null;
  ofType: GqlInputObjectSchemaType | null;
}

export interface GqlSchemaInputArgument {
  name: string;
  type: GqlInputObjectSchemaType;
}
export interface GqlInputObjectSchema {
  name: string;
  args: GqlSchemaInputArgument[];
}

// Partial schema introspection for object types. Includes non-object fields only.
export const HmisObjectSchemas: GqlSchema[] = ${JSON.stringify(objectSchemas)};

// Partial schema introspection for input object types.
export const HmisInputObjectSchemas: GqlInputObjectSchema[] = ${JSON.stringify(
  inputObjectSchemas
)};
`;
fs.writeFile('src/types/gqlObjects.ts', schemaOutput, (err) => {
  // eslint-disable-next-line no-console
  if (err) return console.log(err);
});
