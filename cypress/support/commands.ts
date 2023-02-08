/* global JQuery */
/// <reference types="cypress" />

Cypress.Commands.add('testId', (id, pseudo) => {
  return cy.get(`[data-testid="${id}"]${pseudo || ''}`);
});
Cypress.Commands.add(
  'findTestId',
  { prevSubject: true },
  (subject, id, pseudo) => {
    return subject.find(`[data-testid="${id}"]${pseudo || ''}`);
  }
);

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
  cy.inputId(id).click({ force: true });
  cy.get('.MuiAutocomplete-popper .MuiAutocomplete-loading').should(
    'not.exist'
  );
  // cy.get(`.MuiAutocomplete-listbox [data-testid="option-${optionCode}"]`)
  cy.get(`.MuiAutocomplete-listbox`)
    .findTestId(`option-${optionCode}`)
    .as('option');

  cy.get('@option').click();
});

Cypress.Commands.add('safeType', { prevSubject: true }, (subject, str) => {
  return cy.wrap(subject).type(str).should('have.value', str);
});

Cypress.Commands.add('checkOption', (id, optionCode) => {
  cy.get(`[id="${id}"] input[value="${optionCode}"]`).check();
});
Cypress.Commands.add('uncheckOption', (id, optionCode) => {
  cy.get(`[id="${id}"] input[value="${optionCode}"]`).uncheck({ force: true });
});

Cypress.Commands.add('getChecked', (id, value) => {
  cy.get(
    `[id="${id}"] [data-checked="true"] ${
      value ? `input[value="${value}"]` : ''
    }`
  );
});

Cypress.Commands.add('displayItem', (linkId) => {
  cy.testId(`display-${linkId}`);
});

Cypress.Commands.add('displayItems', (linkIds) => {
  cy.get(linkIds.map((id) => `[data-testid="display-${id}"]`).join(', '));
});

Cypress.Commands.add('expectHudValuesToInclude', (values) => {
  cy.testId('submitFormButton').first().click({ ctrlKey: true });
  cy.window().then((win) => {
    expect(win.debug.hudValues).to.include(values);
  });
});

Cypress.Commands.add('expectHudValuesSectionToDeepEqual', (values) => {
  cy.testId('submitFormButton').first().click({ ctrlKey: true });
  cy.window().then((win) => {
    expect(
      Object.fromEntries(
        Object.entries(win.debug.hudValues).filter(
          ([key]) =>
            key.includes(`${Object.keys(values)[0].split('.')[0]}.`) &&
            key !== 'Enrollment.entryDate'
        )
      )
    ).to.deep.equal(values);
  });
});

Cypress.Commands.add('expectHudValuesToDeepEqual', (values) => {
  cy.testId('submitFormButton').first().click({ ctrlKey: true });
  cy.window().then((win) => {
    expect(win.debug.hudValues).to.deep.equal(values);
  });
});

// Cypress.Commands.add('expectHudValuesToNotHaveKeys', (keys) => {
//   cy.testId('submitFormButton').first().click({ ctrlKey: true });
//   cy.window().then((win) => {
//     expect(win.debug.hudValues).not.to.have.keys(keys);
//   });
// });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  interface Window {
    debug: any;
  }
  namespace Cypress {
    interface Chainable {
      // Actions
      login(email: string, password: string): Chainable<JQuery<Element>>;
      choose(id: string, optionCode: string): Chainable<JQuery<Element>>;
      safeType(str: string): Chainable<JQuery<Element>>;
      createClient(
        firstName: string,
        lastName: string
      ): Chainable<JQuery<Element>>;

      // Form actions
      checkOption(id: string, optionCode: string): Chainable<JQuery<Element>>;
      uncheckOption(id: string, optionCode: string): Chainable<JQuery<Element>>;

      // Selectors
      testId(id: string, pseudo?: string): Chainable<JQuery<Element>>;
      findTestId(id: string, pseudo?: string): Chainable<JQuery<Element>>;
      getById(id: string): Chainable<JQuery<Element>>;
      inputId(id: string): Chainable<JQuery<Element>>;
      getByIds(ids: string[]): Chainable<JQuery<Element>>;
      displayItem(linkId: string): Chainable<JQuery<Element>>;
      displayItems(linkIds: string[]): Chainable<JQuery<Element>>;
      getChecked(id: string, value?: string): Chainable<JQuery<Element>>;

      // Assertions
      expectHudValuesToInclude(values: Record<string, any>): null;
      expectHudValuesToDeepEqual(values: Record<string, any>): null;
      expectHudValuesSectionToDeepEqual(values: Record<string, any>): null;
      // expectHudValuesToNotHaveKeys(keys: string[]): null;

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
