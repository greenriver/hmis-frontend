Cypress.session.clearAllSavedSessions();

beforeEach(() => {
  cy.login();
  cy.visit('/');
});

it('should create client, and be able to see it in search results', () => {
  cy.testId('clientSearchInput').type('test{enter}');
  cy.testId('addClientButton').click();

  // create client
  const uuid = () => Cypress._.random(0, 1e6);
  const id = uuid();
  const firstName = `First ${id}`;
  const lastName = `Last ${id}`;
  cy.createClient(firstName, lastName);

  // search for client
  cy.visit('/');
  cy.testId('clientSearchInput').type(`${firstName}{enter}`);
  cy.testId('table-linkedCell').contains(firstName).should('be.visible');

  // view results as cards
  cy.testId('cardToggleButton', ':not([disabled])').click();
  cy.testId('clientSearchResultCard').contains(firstName).should('be.visible');

  // go to client profile
  cy.testId('tableToggleButton', ':not([disabled])').click();
  cy.testId('table-linkedCell').contains(firstName).click();

  // Delete the client
  cy.testId('sideNav-overview').click();
  cy.testId('editClientButton').click();
  cy.testId('deleteClientButton').click();
  cy.confirmDialog();
});
