import isNumber from 'lodash-es/isNumber';

import ExpressionEvaluationError from './ExpressionEvaluationError';
import formulaFunctions from './formulaFunctions';
import { parseExpression } from './parser';

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
      const fn = formulaFunctions.get(ast.callee.name.toUpperCase());
      if (ast.callee && fn) {
        const args = ast.arguments.map((arg: any) => evaluate(arg, context));
        return fn(...args);
      } else {
        throw new ExpressionEvaluationError(
          `Undefined function: ${ast.callee.name}`
        );
      }
    case 'Identifier':
      return context.get(ast.name);
    default:
      throw new ExpressionEvaluationError(
        `Unsupported AST node type: ${ast.type}`
      );
  }
};

export const evaluateFormula = (
  expression: string,
  context: EvalContext
): string | undefined => {
  const parsedExpression = parseExpression(expression);

  try {
    const result = evaluate(parsedExpression, context);
    return result ? result + '' : undefined;
  } catch (error) {
    if (error instanceof ExpressionEvaluationError) {
      return undefined;
    } else {
      throw error;
    }
  }
};
