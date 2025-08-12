const formulaFunctions = new Map();
formulaFunctions.set('ABS', Math.abs);

// Rounding functions
formulaFunctions.set('ROUND', Math.round);
formulaFunctions.set('CEIL', Math.ceil);
formulaFunctions.set('FLOOR', Math.floor);

// Round to specific decimal places
formulaFunctions.set('ROUNDTO', (value: number, decimals: number) => {
  if (decimals === undefined || decimals === null) decimals = 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
});

// functions to expose in a formula expression
export default formulaFunctions;
