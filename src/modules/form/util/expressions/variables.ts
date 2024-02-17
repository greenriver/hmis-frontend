import ExpressionEvaluationError from './ExpressionEvaluationError';
import { parseExpression } from './parser';

type Collection = Array<string>;
const evaluate = (ast: any, collect: Collection) => {
  switch (ast.type) {
    case 'BinaryExpression':
      evaluate(ast.left, collect);
      evaluate(ast.right, collect);
      return;
    case 'Identifier':
      if (ast.name) collect.push(ast.name);
      return;
    case 'CallExpression':
      ast.arguments.map((arg: any) => evaluate(arg, collect));
      return;
    default:
      return;
  }
};

export const expressionVariables = (expression: string): Array<string> => {
  const variables: Array<string> = [];
  const ast = parseExpression(expression);
  try {
    evaluate(ast, variables);
    return variables;
  } catch (error) {
    if (error instanceof ExpressionEvaluationError) {
      return [];
    } else {
      throw error;
    }
  }
};
