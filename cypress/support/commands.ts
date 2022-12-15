/* global JQuery */
/// <reference types="cypress" />

Cypress.Commands.add('testId', (id, pseudo) => {
  return cy.get(`[data-testid=${id}]${pseudo || ''}`);
});

Cypress.Commands.add('login', (email, password) => {
  cy.session(
    email,
    () => {
      cy.visit('/');
      cy.get('input[name=email]').type(email);
      cy.get('input[name=password]').type(`${password}{enter}`, { log: false });
      cy.get('header');
    },
    {
      validate: () => {
        cy.getCookie('_boston-hmis_session').should('exist');
        // TODO check local storage
      },
      // cacheAcrossSpecs: true,
    }
  );
});

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      testId(id: string, pseudo?: string): Chainable<JQuery<Element>>;
      login(email: string, password: string): Chainable<JQuery<Element>>;
    }
  }
}

export {};
