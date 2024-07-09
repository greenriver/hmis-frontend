import { isNil } from 'lodash-es';
import ExpressionEvaluationError from './ExpressionEvaluationError';
import { parseExpression } from './parser';
import displayFunctions from './templateFunctions';
import {
  formatDateForDisplay,
  safeParseDateOrString,
} from '@/modules/hmis/hmisUtil';

type EvalContext = Map<string, any>;
const evaluate = (ast: any, context: EvalContext): number | undefined => {
  switch (ast.type) {
    case 'Literal':
      return ast.value;
    case 'CallExpression':
      const fn = displayFunctions.get(ast.callee.name.toUpperCase());
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
      // we could support operations here too
      throw new ExpressionEvaluationError(
        `Unsupported AST node type: ${ast.type}`
      );
  }
};

const evaluateTemplateVariable = (
  expression: string,
  context: EvalContext
): string | undefined => {
  const parsedExpression = parseExpression(expression);

  try {
    const result = evaluate(parsedExpression, context);
    // test using isNil so 0 doesn't end up as falsy
    if (isNil(result)) return undefined;

    // If result is a date or a date string (YYYY-MM-DD), format it for display
    const resultAsDate = safeParseDateOrString(result);
    if (resultAsDate) return formatDateForDisplay(resultAsDate) || result + '';

    return result + '';
  } catch (error) {
    if (error instanceof ExpressionEvaluationError) {
      return undefined;
    } else {
      throw error;
    }
  }
};

// evaluate a display statement. We fake string interpolation with a regex. Probably a better way
// Example evaluateTemplate("hello ${name}", new Map([[name: 'world']]))
export const evaluateTemplate = (
  template: string,
  context: EvalContext
): string => {
  // doesn't match if the braces are escaped
  const regex = /\${(.*?)}/g;
  return template.replace(regex, (match, key) => {
    return evaluateTemplateVariable(key, context) || 'N/A';
  });
};
