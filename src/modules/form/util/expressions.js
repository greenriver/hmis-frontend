import jsep from 'jsep';

export const evaluateExpression = (expression, context) => {
  const parsedExpression = jsep(expression);

  return evaluate(parsedExpression, context);
};

export const collectVariablesFromExpression = (expression) => {
  const variables = [];
  const ast = jsep(expression);
  tokens(ast, variables);
  return variables;
};

export const tokens = (ast, collect) => {
  switch (ast.type) {
    case 'BinaryExpression':
      tokens(ast.left, collect);
      tokens(ast.right, collect);
    case 'Identifier':
      if (ast.name) collect.push(ast.name);
    default:
      return;
  }
};

const functions = new Map();
functions.add('formatMinutes', function formatMinutes(minutes) {
  if (!minutes) return '0 minutes';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let result = '';

  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  if (hours > 0 && remainingMinutes > 0) {
    result += ' and ';
  }

  if (remainingMinutes > 0) {
    result += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }

  return result || '0 minutes';
});

const evaluate = (ast, context) => {
  switch (ast.type) {
    case 'BinaryExpression':
      const left = evaluate(ast.left, context);
      const right = evaluate(ast.right, context);
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
          throw new Error(`Unsupported operator: ${ast.operator}`);
      }
    case 'Literal':
      return ast.value;
    case 'CallExpression':
      const fn = functions.get(ast.callee.name);
      if (ast.callee && fn) {
        const args = ast.arguments.map((arg) => evaluate(arg, context));
        return fn(...args);
      } else {
        throw new Error(`Undefined function: ${ast.callee.name}`);
      }
    case 'Identifier':
      const value = context.get(ast.name);
      return value ? value : 0;
    //if (context.hasOwnProperty(ast.name)) {
    //} else {
    //  // throw new Error(`Undefined variable: ${ast.name}`);
    //  console.info(`Undefined variable: ${ast.name}`);
    //  return 0
    //}
    default:
      throw new Error(`Unsupported AST node type: ${ast.type}`);
  }
};
