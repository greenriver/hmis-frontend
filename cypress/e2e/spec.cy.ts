describe('HMIS', () => {
  beforeEach(() => {
    cy.visit('/');
    // TODO just intercept and pass the form defs. mock serevr is too much to deal with
  });

  it('search and edit client', () => {
    cy.get('input[name="textSearch"]').type('ja sm{enter}');
    // cy.testId('goToProfileButton').first().click();
    cy.testId('table-linkedCell').first().click();
    cy.testId('clientProfile').should('be.visible');
    cy.testId('editClientButton').first().click();

    // cy.testId('formField').each(($elem) => {
    //   cy.wrap($elem).find('input').as('input');
    //   cy.get('@input').should('have.attr', 'name');

    //   // TODO need special case for multi-select which has empty value
    //   cy.get('@input').invoke('val').should('not.be.empty');
    // });
  });

  it('search and create new client', () => {
    cy.get('input[name="textSearch"]').type('ja sm{enter}');
    // cy.testId('addClientButton').first().click();
    // fill in all values
    // command-click and inspect the transformed values
  });
});
