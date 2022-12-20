/* global JQuery */
/// <reference types="cypress" />

Cypress.Commands.add('testId', (id, pseudo) => {
  return cy.get(`[data-testid="${id}"]${pseudo || ''}`);
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

Cypress.Commands.add('createClient', (firstName, lastName) => {
  cy.visit('/client/new');
  cy.get('input[id="first-name"]').type(firstName);
  cy.get('input[id="last-name"]').type(lastName);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('getById', (id) => {
  cy.get(`[id="${id}"]`);
});

Cypress.Commands.add('getByIds', (ids) => {
  cy.get(ids.map((id) => `[id="${id}"]`).join(', '));
});

Cypress.Commands.add('inputId', (id) => {
  cy.get(`input[id="${id}"]`);
});

Cypress.Commands.add('choose', (id, optionCode) => {
  cy.inputId(id).click();
  cy.testId(`option-${optionCode}`).click();
});

Cypress.Commands.add('displayItem', (linkId) => {
  cy.testId(`display-${linkId}`);
});

Cypress.Commands.add('displayItems', (linkIds) => {
  cy.get(linkIds.map((id) => `[data-testid="display-${id}"]`).join(', '));
});

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      // Actions
      login(email: string, password: string): Chainable<JQuery<Element>>;
      choose(id: string, optionCode: string): Chainable<JQuery<Element>>;
      createClient(
        firstName: string,
        lastName: string
      ): Chainable<JQuery<Element>>;

      // Selectors
      testId(id: string, pseudo?: string): Chainable<JQuery<Element>>;
      getById(id: string): Chainable<JQuery<Element>>;
      inputId(id: string): Chainable<JQuery<Element>>;
      getByIds(ids: string[]): Chainable<JQuery<Element>>;
      displayItem(linkId: string): Chainable<JQuery<Element>>;
      displayItems(linkIds: string[]): Chainable<JQuery<Element>>;

      // Assessment section assertions
      assertPriorLivingSituation(): null;
      assertIncomeAndSources(): null;
      assertNonCashBenefits(): null;
      assertHealthInsurance(): null;
      assertDisability(): null;
      assertHealthAndDV(): null;
    }
  }
}

export {};
