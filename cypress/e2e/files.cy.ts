// This only works when running against the real backend.
// Must set the following env vars with real username/pw from local environment:

// export CYPRESS_EMAIL=
// export CYPRESS_PASSWORD=

Cypress.session.clearAllSavedSessions();

beforeEach(() => {
  cy.login(Cypress.env('EMAIL'), Cypress.env('PASSWORD'));
  cy.visit('/');
});

it(
  'should allow uploading and deleting client files',
  {
    viewportHeight: 1000, // extra long height so its easier to see what's going on
    viewportWidth: 1024,
  },
  () => {
    // Set up new client
    cy.createClient('Cy First', 'Cy Last');

    // Got to files tab and create new file
    cy.get('#side-nav-files').click();
    cy.get('#add-client-file').click();
    cy.choose('tags', '1', 'firstTag');
    cy.get('body').type('{esc}');
    cy.inputId('effectiveDate').clear().type('01012020');
    cy.inputId('expirationDate').clear().type('01012020');
    cy.checkOption('confidential', 'true');
    cy.get('#fileBlobId').selectFile('cypress/fixtures/example.json', {
      action: 'drag-drop',
    });
    cy.get('#fileBlobId').contains('Uploading').should('not.exist');
    cy.get('#fileBlobId').contains('example.json').should('exist');
    cy.get('button[type="submit"]').click();

    // Ensure file exists
    cy.get('table tbody').find('tr').first().as('fileRow');
    cy.get('@fileRow').contains('example.json').should('exist');
    cy.get('@fileRow').contains('Download').should('exist');
    cy.get('@fileRow').contains('Edit').should('exist');
    cy.get('@fileRow').contains('Delete').should('exist');

    // Edit file
    cy.get('@fileRow').contains('example.json').click();
    cy.get('#fileBlobId').should('not.exist');
    cy.choose('tags', '2', 'secondTag');
    cy.get('body').type('{esc}');
    cy.get('button[type="submit"]').click();

    // Check the edit
    cy.get('table tbody').find('tr').first().as('fileRow');
    cy.get('@fileRow').get('#tag-1').should('exist');
    cy.get('@fileRow').get('#tag-2').should('exist');

    // Delete the file
    cy.get('@fileRow').contains('Delete').click();
    cy.get('@fileRow').contains('Deleting').should('not.exist');
    cy.get('table tbody').contains('example.json').should('not.exist');
  }
);
