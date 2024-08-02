Cypress.session.clearAllSavedSessions();

beforeEach(() => {
  cy.login();
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
    const uuid = () => Cypress._.random(0, 1e6);
    const id = uuid();
    const firstName = `First ${id}`;
    const lastName = `Last ${id}`;
    cy.createClient(firstName, lastName);

    // Got to files tab and create new file
    cy.navItem('files').click();
    cy.testId('addClientFileButton').click();
    cy.choose('file-tags', '1', 'firstTag');
    cy.exitModal();
    // cy.inputId('effectiveDate').clear().type('01012020');
    // cy.inputId('expirationDate').clear().type('01012020');
    // cy.checkOption('file-confidential', 'true');
    cy.get('#file-blob-id').selectFile('cypress/fixtures/example.json', {
      action: 'drag-drop',
    });
    cy.get('#file-blob-id').contains('Uploading').should('not.exist');
    cy.get('#file-blob-id').contains('example.json').should('exist');
    cy.get('button[type="submit"]').click();

    // Ensure file exists
    cy.get('table tbody').find('tr').first().as('fileRow');
    cy.get('@fileRow').contains('example.json').should('exist');

    // Check file modal
    cy.get('@fileRow').contains('example.json').click();
    cy.get('.MuiDialog-container').as('dialog').should('exist');
    cy.get('@dialog').contains('Download').should('exist');
    cy.get('@dialog').contains('Edit').should('exist');
    cy.get('@dialog').contains('Delete').should('exist');
    cy.get('@dialog').contains('No Preview Available').should('exist');
    cy.get('@dialog').get('a').contains('download the file').should('exist');
    cy.exitModal();

    // Edit file
    cy.get('@fileRow').click();
    cy.get('.MuiDialog-container').contains('Edit').click();
    cy.get('#file-blob-id').should('not.exist');
    cy.choose('file-tags', '2', 'secondTag');
    cy.exitModal();
    cy.get('button[type="submit"]').click();

    // Check the edit
    cy.get('table tbody').find('tr').first().as('fileRow');
    cy.get('@fileRow').get('#tag-1').should('exist');
    cy.get('@fileRow').get('#tag-2').should('exist');

    // Delete the file
    cy.get('@fileRow').click();
    cy.get('.MuiDialog-container').contains('Delete').click();
    cy.confirmDialog();
    cy.get('table').contains('No files').should('exist');

    // Delete the client
    cy.navItem('overview').click();
    cy.testId('editClientButton').click();
    cy.testId('deleteClientButton').click();
    cy.confirmDialog();
  }
);