describe('HMIS', () => {
  beforeEach(() => {
    cy.visit('/');
    // cy.intercept('/hmis/user.json', (req) => {
    //   req.reply({ email: 'noreply@example.com', name: 'Test User' });
    // });
  });

  it('search and edit client', () => {
    cy.get('input[name="textSearch"]').type('ja sm{enter}');
    cy.testId('table-linkedCell').first().click();
    cy.testId('clientProfile').should('be.visible');
    // cy.testId('editClientButton').first().click();

    // cy.testId('formField').each(($elem) => {
    //   cy.wrap($elem).find('input').as('input');
    //   cy.get('@input').should('have.attr', 'name');

    //   // TODO need special case for multi-select which has empty value
    //   cy.get('@input').invoke('val').should('not.be.empty');
    // });
  });
});
