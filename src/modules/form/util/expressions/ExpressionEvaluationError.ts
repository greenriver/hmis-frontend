class ExpressionEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Expression Evaluation Error';
  }
}

export default ExpressionEvaluationError;
