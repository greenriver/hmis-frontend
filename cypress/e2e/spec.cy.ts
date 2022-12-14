describe('HMIS', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('search and edit client', () => {
    cy.get('input[name="textSearch"]').type('ja sm{enter}');
    // cy.testId('goToProfileButton').first().click();
    cy.testId('table-linkedCell').first().click();
    cy.testId('clientProfile').should('be.visible');
    cy.testId('editClientButton').first().click();
    // ensure all values are filled in
    // do it in a generic way and do this for all forms
  });

  it('search and create new client', () => {
    cy.get('input[name="textSearch"]').type('ja sm{enter}');
    cy.testId('addClientButton').first().click();
    // fill in all values
    // command-click and inspect the transformed values
  });
});
