'use strict';

const fs = require('fs');

const geocodes = [];
const geocodesByState = {};
const aians = [];
fs.readFile('geocodes.csv', 'utf8', function (err, data) {
  const rows = data.split('\n');

  rows.forEach((r) => {
    const aianMatch = r.match(/\"([0-9]*)\s+([A-Z]{2})\s+(.*)([0-9]{6})(.*)\$/);
    const geocodeMatch = r.match(/\"([0-9]*)\s+([A-Z]{2})\s+(.*)\$/);
    if (geocodeMatch) {
      const geocode = geocodeMatch[1].trim();
      const state = geocodeMatch[2].trim();
      const name = geocodeMatch[3].trim();
      geocodes.push({ geocode, state, name });
      if (!geocodesByState[state]) geocodesByState[state] = [];
      geocodesByState[state].push({ geocode, name });
    } else if (aianMatch) {
      const aian = aianMatch[1].trim();
      const state = aianMatch[2].trim();
      const name = aianMatch[3].trim();
      const geocode = aianMatch[4].trim();
      const county = aianMatch[5].trim();

      aians.push({ aian, state, name, geocode, county });
    } else if (r) {
      // console.log('MISSING: ' + r);
    }
  });

  // fs.writeFile('geocodes.json', JSON.stringify(geocodes, null, 2), (err) => {
  //   if (err) return console.log(err);

  // });
  Object.keys(geocodesByState).forEach((s) => {
    fs.writeFile(
      `geocodes-${s}.json`,
      JSON.stringify(geocodesByState[s]),
      (err) => {
        // eslint-disable-next-line no-console
        if (err) return console.log(err);
      }
    );
  });
  // fs.writeFile('aian_codes.json', JSON.stringify(aians, null, 2), (err) => {
  //   if (err) return console.log(err);

  // });
});
