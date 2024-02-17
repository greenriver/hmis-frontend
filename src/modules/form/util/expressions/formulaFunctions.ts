const formulaFunctions = new Map();
const abs = (v: number) => {
  return Math.abs(v);
};
formulaFunctions.set('ABS', abs);
export default formulaFunctions;
