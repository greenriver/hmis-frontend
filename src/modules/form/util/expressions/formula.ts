import ExpressionEvaluationError from './ExpressionEvaluationError';
import formulaFunctions from './formulaFunctions';
import { parseExpression } from './parser';
import { parseNumber } from '@/utils/numbers';

const ensureNumeric = (value: any): number => {
  if (parseNumber(value) === undefined)
    throw new ExpressionEvaluationError('Non numeric result');
  return value;
};

type EvalContext = Map<string, any>;
const evaluate = (ast: any, context: EvalContext): number | undefined => {
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
    case 'UnaryExpression':
      const argument = ensureNumeric(evaluate(ast.argument, context));
      switch (ast.operator) {
        case '-':
          return -argument;
        default:
          throw new ExpressionEvaluationError(
            `Unsupported unary operator: ${ast.operator}`
          );
      }
    case 'Literal':
      return parseNumber(ast.value);
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

// evaluate a mathematical formula
export const evaluateFormula = (
  expression: string,
  context: EvalContext
): number | undefined => {
  const parsedExpression = parseExpression(expression);

  try {
    const result = evaluate(parsedExpression, context);
    return result === undefined ? undefined : result;
  } catch (error) {
    if (error instanceof ExpressionEvaluationError) {
      return undefined;
    } else {
      throw error;
    }
  }
};
