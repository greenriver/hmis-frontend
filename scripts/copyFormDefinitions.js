'use strict';
/**
 * Copy form definitions from Warehouse to serverMock so they can be used for e2e testing.
 * Runs with `yarn graphql:codegen`
 */

const fs = require('fs');
const path = require('path');

const camelizeKeys = function (obj) {
  if (typeof obj !== 'object') return obj;

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key, _]) => !key.startsWith('_'))
      .map(([key, value]) => {
        if (Array.isArray(value))
          value = (value || []).map((o) => camelizeKeys(o));
        return [
          key.replace(/_([a-z])/g, function (g) {
            return g[1].toUpperCase();
          }),
          value,
        ];
      })
  );
};

const copyRecursiveSync = function (src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else if (src.endsWith('.json')) {
    fs.readFile(src, 'utf8', (error, data) => {
      if (error) console.log(error);

      const modified = camelizeKeys(JSON.parse(data));

      fs.writeFile(dest, JSON.stringify(modified), (error) => {
        if (error) console.log(error);
        console.log('Wrote', dest);
      });
    });
  }
};

const schemaPath = process.argv[2];
if (!schemaPath) throw Error('Schema path missing');

const formDataDir = schemaPath.replace('schema.graphql', '../../lib/form_data');

copyRecursiveSync(formDataDir, './serverMock/forms');
