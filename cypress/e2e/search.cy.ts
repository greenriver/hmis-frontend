// This only works when running against the real backend

// export CYPRESS_EMAIL=
// export CYPRESS_PASSWORD=

Cypress.session.clearAllSavedSessions();

beforeEach(() => {
  cy.login();
  cy.visit('/');
});

it('view search results as table', () => {
  cy.testId('clientSearchInput').type('test{enter}');
  cy.testId('tableToggleButton', ':not([disabled])').click();
  cy.testId('table-linkedCell').first().click();
  cy.testId('clientProfile').should('be.visible');
});

it('view search results as cards', () => {
  cy.testId('clientSearchInput').type('test{enter}');
  cy.testId('cardToggleButton', ':not([disabled])').click();
  cy.testId('goToProfileButton').first().click();
  cy.testId('clientProfile').should('be.visible');
});
