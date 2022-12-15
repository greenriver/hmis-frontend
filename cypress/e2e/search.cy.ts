// This only works when running against the real backend

// export CYPRESS_EMAIL=
// export CYPRESS_PASSWORD=

Cypress.session.clearAllSavedSessions();

beforeEach(() => {
  cy.login(Cypress.env('EMAIL'), Cypress.env('PASSWORD'));
  cy.visit('/');
});

it('view search results as table', () => {
  cy.get('input[name="textSearch"]').type('ja sm{enter}');
  cy.testId('pagination');
  cy.testId('searchResultsTableButton', ':not([disabled])').click();
  cy.testId('table-linkedCell').first().click();
  cy.testId('clientProfile').should('be.visible');
  // cy.testId('editClientButton').first().click();
});

it('view search results as cards', () => {
  cy.get('input[name="textSearch"]').type('ja sm{enter}');
  cy.testId('pagination');
  cy.testId('searchResultsCardsButton', ':not([disabled])').click();
  cy.testId('goToProfileButton').first().click();
  cy.testId('clientProfile').should('be.visible');
  // cy.testId('editClientButton').first().click();
});
