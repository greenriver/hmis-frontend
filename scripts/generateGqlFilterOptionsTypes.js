'use strict';

/**
 * Reads graphql.schema.json (from graphql-codegen introspection) and emits
 * src/types/gqlFilterOptionsTypes.generated.ts with all input object types
 * whose name ends with `FilterOptions`.
 *
 * This is used to make table filtering type-safe (see useTableFilters.ts).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const generatedFileHeader =
  '// **** THIS FILE IS GENERATED, DO NOT EDIT DIRECTLY ****\n\n';

const schemaPath = path.join(repoRoot, 'graphql.schema.json');
const outPath = path.join(
  repoRoot,
  'src/types/gqlFilterOptionsTypes.generated.ts'
);

const raw = fs.readFileSync(schemaPath, 'utf8');
const schema = JSON.parse(raw);

const types = schema.__schema?.types ?? [];
const names = types
  .filter(
    (t) =>
      t.kind === 'INPUT_OBJECT' &&
      typeof t.name === 'string' &&
      t.name.endsWith('FilterOptions')
  )
  .map((t) => t.name)
  .sort((a, b) => a.localeCompare(b));

if (names.length === 0) {
  console.error(
    'generateGqlFilterOptionsTypes: no *FilterOptions INPUT_OBJECT types found'
  );
  process.exit(1);
}

const importLine = `import type {\n${names.map((n) => `  ${n}`).join(',\n')},\n} from './gqlTypes';\n\n`;

const mapEntries = names.map((n) => `  ${n}: ${n};`).join('\n');

const output = `${generatedFileHeader}${importLine}export type FilterOptionsByName = {\n${mapEntries}\n};\n\nexport type FilterOptionsGraphqlTypeName = keyof FilterOptionsByName;\n\nexport const FILTER_OPTIONS_GRAPHQL_TYPE_NAMES = [\n${names.map((n) => `  '${n}'`).join(',\n')},\n] as const;\n`;

fs.writeFileSync(outPath, output, 'utf8');
