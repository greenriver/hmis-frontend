/* global JQuery */
/// <reference types="cypress" />

Cypress.Commands.add('testId', (id) => {
  return cy.get(`[data-testid=${id}]`);
});

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      testId(id: string): Chainable<JQuery<Element>>;
    }
  }
}

export {};
