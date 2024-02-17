import jsep from 'jsep';
import isNumber from 'lodash-es/isNumber';

import ExpressionEvaluationError from './ExpressionEvaluationError';
import formulaFunctions from './formulaFunctions';

const ensureNumeric = (value: any): number => {
  if (!isNumber(value))
    throw new ExpressionEvaluationError('Non numeric result');
  return value;
};

type EvalContext = Map<string, any>;
const evaluate = (ast: any, context: EvalContext): number => {
  switch (ast.type) {
    case 'BinaryExpression':
      const left = ensureNumeric(evaluate(ast.left, context));
      const right = ensureNumeric(evaluate(ast.right, context));
      switch (ast.operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          return left / right;
        default:
          throw new ExpressionEvaluationError(
            `Unsupported operator: ${ast.operator}`
          );
      }
    case 'Literal':
      return ast.value;
    case 'CallExpression':
      const fn = formulaFunctions.get(ast.callee.name);
      if (ast.callee && fn) {
        const args = ast.arguments.map((arg: any) => evaluate(arg, context));
        return fn(...args);
      } else {
        throw new ExpressionEvaluationError(
          `Undefined function: ${ast.callee.name}`
        );
      }
    case 'Identifier':
      const value = context.get(ast.name);
      return value ? value : 0;
    default:
      throw new ExpressionEvaluationError(
        `Unsupported AST node type: ${ast.type}`
      );
  }
};

export const evaluateFormula = (expression: string, context: EvalContext) => {
  console.info('evaluate', expression);
  const parsedExpression = jsep(expression);

  return evaluate(parsedExpression, context);
};
