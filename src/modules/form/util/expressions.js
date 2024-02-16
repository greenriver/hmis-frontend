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
