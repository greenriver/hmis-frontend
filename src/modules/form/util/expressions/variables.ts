import jsep from 'jsep';

type Collection = Array<string>;
const collectVariables = (ast: any, collect: Collection) => {
  switch (ast.type) {
    case 'BinaryExpression':
      collectVariables(ast.left, collect);
      collectVariables(ast.right, collect);
      return;
    case 'Identifier':
      if (ast.name) collect.push(ast.name);
      return;
    case 'CallExpression':
      ast.arguments.map((arg: any) => collectVariables(arg, collect));
      return;
    default:
      return;
  }
};

export const expressionVariables = (expression: string) => {
  const variables: Array<string> = [];
  const ast = jsep(expression);
  collectVariables(ast, variables);
  return variables;
};
