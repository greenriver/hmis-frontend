import { EmptyProjectCoc, HIDDEN } from 'support/assessmentConstants';
import { HmisEnums } from '../../src/types/gqlEnums';
import {
  FundingSource,
  GeographyType,
  HouseholdType,
  NoYes,
  ProjectType,
} from '../../src/types/gqlTypes';

Cypress.session.clearAllSavedSessions();

beforeEach(() => {
  cy.login();
  cy.visit('/');
});

it('should create new Project, Funder, Project CoC, and Inventory', () => {
  // Go to organization
  cy.testId('navToProjects').click();
  cy.testId('viewOrganizationsButton').click();
  cy.tableRows('allProjectsTable').first().click(); // go to first org, it should be the E2E test org since this user only has access to 1

  // Add a new project
  const projectName = 'X Test Project';
  const projectType = '2.02.6';
  cy.testId('addProjectButton').click();
  cy.inputId('2.02.2').safeType(projectName);
  cy.getById('description').safeType('Project Description');
  cy.getById('contact').safeType('Project Contact');

  // Start and end dates
  cy.inputId('2.02.3').safeType('01/01/2022'); // start date
  cy.inputId('2.02.4').safeType('01/01/2020'); // end date (invalid, must be after start)

  // Set project type
  cy.choose(projectType, ProjectType.DayShelter);

  // Set continuum project
  cy.checkOption('2.02.5', NoYes.Yes);

  // Submit
  cy.testId('formButton-submit').click();
  cy.testId('formErrorAlert').should('exist'); // end date invalid

  // Fix and resubmit
  cy.inputId('2.02.4').clear(); // clear end date
  const expectedFormValues = {
    projectName,
    description: 'Project Description',
    contactInformation: 'Project Contact',
    operatingStartDate: '2022-01-01',
    operatingEndDate: null,
    projectType: ProjectType.DayShelter,
  };
  cy.expectHudValuesToInclude(expectedFormValues);
  cy.testId('formButton-submit').click();

  // Confirm details are correct
  cy.testId('dynamicView').should('exist');
  cy.testId('2.02.6').contains('Day Shelter');

  // Navigate to Organization page
  cy.testId('organizationLink').click();

  // Navigate back to project page
  cy.testId('loading').should('not.exist');
  cy.tableRows('projectsCard').contains(projectName).click();

  // Re-open project, assert details are the same
  cy.testId('updateProjectButton').click();
  cy.expectHudValuesToInclude(expectedFormValues);

  const newProjectName = 'X Renamed Project';
  cy.inputId('2.02.2').clear().safeType(newProjectName);
  cy.choose(projectType, ProjectType.Sh);
  cy.testId('formButton-submit').click();

  // Assert changes to project details are reflected
  cy.get('h3').first().contains(newProjectName);
  cy.testId('dynamicView').should('exist');
  cy.testId('2.02.6').contains(HmisEnums.ProjectType.SH);

  // Navigate to Organization page, ensure change to project type is reflected there too
  cy.testId('organizationLink').click();
  cy.tableRows('projectsCard').contains('SH').should('exist');

  // Navigate back to project page
  cy.tableRows('projectsCard').contains(newProjectName).click();

  /*** Funder ***/

  // Create funder
  cy.navItem('funders').click();
  cy.testId('addFunderButton').click();

  cy.inputId('grant-id').safeType('ABC123');

  cy.inputId('other').should('not.exist');
  cy.choose('funder', FundingSource.LocalOrOtherFundingSource);
  cy.inputId('other').should('exist');

  cy.testId('formButton-submit').click();
  cy.testId('formErrorAlert').contains('Other Funder').should('exist');

  cy.inputId('other').safeType('other funder details');

  // Test non-overlapping end date warning
  cy.inputId('start').safeType('01/01/2020');
  cy.inputId('end').safeType('01/01/2021');
  cy.testId('alert-date-range-warning').should('exist');

  // Invalid (end before start)
  cy.inputId('start').clear().safeType('01/01/2022');
  cy.inputId('end').clear().safeType('01/01/2021');

  cy.testId('formButton-submit').click();
  cy.testId('formErrorAlert')
    .contains('End date must be on or after start date')
    .should('exist');

  cy.inputId('end').clear();
  cy.expectHudValuesToDeepEqual({
    endDate: null,
    funder: FundingSource.LocalOrOtherFundingSource,
    grantId: 'ABC123',
    otherFunder: 'other funder details',
    startDate: '2022-01-01',
  });
  cy.testId('formButton-submit').click();

  cy.testId('loading').should('not.exist');
  cy.tableRows('funderCard').should('have.length', 1);
  cy.tableRows('funderCard').first().click();

  // Edit funder, assert table updated
  cy.choose('funder', FundingSource.HudCocSafeHaven);
  cy.inputId('other').should('not.exist');
  cy.testId('formButton-submit').click();
  cy.tableRows('funderCard').should('have.length', 1);
  cy.tableRows('funderCard').contains('Safe Haven').should('exist');

  // Create another funder
  cy.testId('addFunderButton').click();
  cy.choose('funder', FundingSource.HudEsgCv);
  cy.inputId('grant-id').safeType('ABC123');
  cy.inputId('start').safeType('01/01/2022');
  cy.inputId('end').safeType('01/01/2025');
  cy.expectHudValuesToDeepEqual({
    endDate: '2025-01-01',
    funder: FundingSource.HudEsgCv,
    grantId: 'ABC123',
    otherFunder: HIDDEN,
    startDate: '2022-01-01',
  });
  cy.testId('formButton-submit').click();
  cy.testId('loading').should('not.exist');
  cy.tableRows('funderCard').should('have.length', 2);

  // Delete funder, assert table updated
  cy.tableRows('funderCard').first().click();
  cy.testId('deleteRecordButton-funder').click();
  cy.confirmDialog();
  cy.testId('loading').should('not.exist');
  cy.tableRows('funderCard').should('have.length', 1);

  /** Try to create inventory (unable to because there are no ProjectCoC records yet) */
  cy.navItem('inventory').click();
  cy.testId('addInventoryButton').click();
  cy.choose('hhtype', HouseholdType.HouseholdsWithOnlyChildren);
  cy.inputId('2.07.1').safeType('01/01/2022');
  cy.inputId('unit').safeType('3');
  cy.inputId('other-beds').safeType('3');
  cy.testId('formButton-submit').click();
  cy.testId('formErrorAlert').contains('CoC Code').should('exist');
  cy.testId('formButton-discard').click();

  /*** Project CoC ***/

  // Create new ProjectCoC
  cy.navItem('cocs').click();
  cy.testId('addProjectCocButton').click();
  cy.choose('coc', 'MA-505');
  cy.choose('geocode', '250126');
  cy.choose('geotype', GeographyType.Rural);
  cy.inputId('address1').safeType('Addr 1');
  cy.inputId('address2').safeType('Addr 2');
  cy.inputId('city').safeType('City');
  cy.inputId('zip').safeType('00001');
  cy.expectHudValuesToDeepEqual({
    ...EmptyProjectCoc,
    cocCode: 'MA-505',
    geocode: '250126',
    geographyType: GeographyType.Rural,
    address1: 'Addr 1',
    address2: 'Addr 2',
    city: 'City',
    state: 'MA', // Should be auto-filled
    zip: '00001',
  });
  cy.testId('formButton-submit').click();

  // Assert it shows up
  cy.testId('loading').should('not.exist');
  cy.tableRows('projectCocCard').should('have.length', 1);
  cy.tableRows('projectCocCard').contains('MA-505').should('exist');

  // Update it and ensure changes are reflected in the table
  cy.tableRows('projectCocCard').first().click();
  cy.choose('state', 'AZ');
  cy.testId('formButton-submit').click();
  cy.tableRows('projectCocCard').should('have.length', 1);
  cy.tableRows('projectCocCard').contains('AZ').should('exist');

  // Add another ProjectCoC
  cy.testId('addProjectCocButton').click();
  cy.choose('coc', 'MA-502');
  cy.choose('geocode', '250126');
  cy.expectHudValuesToDeepEqual({
    ...EmptyProjectCoc,
    cocCode: 'MA-502',
    geocode: '250126',
    state: 'MA',
  });
  cy.testId('formButton-submit').click();
  cy.testId('loading').should('not.exist');
  cy.tableRows('projectCocCard').should('have.length', 2);

  // Delete the second ProjectCoC
  cy.tableRows('projectCocCard').first().click();
  cy.testId('deleteRecordButton-projectCoCRecord').click();
  cy.confirmDialog();
  cy.testId('loading').should('not.exist');
  cy.tableRows('projectCocCard').should('have.length', 1);

  /*** Inventory ***/

  // Create new Inventory
  cy.navItem('inventory').click();
  cy.testId('addInventoryButton').click();
  cy.inputId('coc').invoke('val').should('not.be.empty'); // should autofill
  cy.choose('hhtype', HouseholdType.HouseholdsWithOnlyChildren);
  cy.inputId('unit').safeType('0');
  cy.inputId('other-beds').safeType('0');

  cy.inputId('2.07.1').safeType('01/01/2022'); // start date
  cy.inputId('2.07.2').safeType('01/01/2020'); // end date (invalid, must be after start)

  cy.testId('formButton-submit').click();
  cy.testId('formErrorAlert')
    .contains('Inventory end date must be on or after start date')
    .should('exist');

  // Fix end date
  cy.inputId('2.07.2').clear().safeType('01/01/2023');

  cy.expectHudValuesToDeepEqual({
    cocCode: 'MA-505',
    householdType: HouseholdType.HouseholdsWithOnlyChildren,
    availability: HIDDEN,
    esBedType: HIDDEN,
    inventoryStartDate: '2022-01-01',
    inventoryEndDate: '2023-01-01',
    unitInventory: 0,
    bedInventory: 0,
    otherBedInventory: 0,
    chBedInventory: null,
    vetBedInventory: null,
    chVetBedInventory: null,
    youthBedInventory: null,
    youthVetBedInventory: null,
    chYouthBedInventory: null,
  });

  // Submit (create Inventory)
  cy.testId('formButton-submit').click();
  // Assert it shows up in table
  cy.testId('loading').should('not.exist');
  cy.tableRows('inventoryCard').should('have.length', 1);
  cy.tableRows('inventoryCard')
    .contains('Households with only children')
    .should('exist');

  // Update it and ensure changes are reflected in the table
  cy.tableRows('inventoryCard').first().click();
  cy.testId('updateInventoryButton').click();
  cy.choose('hhtype', HouseholdType.HouseholdsWithoutChildren);
  cy.testId('formButton-submit').click();
  cy.tableRows('inventoryCard').should('have.length', 1);
  cy.tableRows('inventoryCard')
    .contains('Households without children')
    .should('exist');

  // Add another Inventory record
  cy.testId('addInventoryButton').click();
  cy.inputId('coc').invoke('val').should('not.be.empty'); // should autofill
  cy.choose('hhtype', HouseholdType.HouseholdsWithAtLeastOneAdultAndOneChild);
  cy.inputId('unit').safeType('0');
  cy.inputId('other-beds').safeType('0');
  cy.inputId('2.07.1').safeType('01/01/2020'); // start date (too early)

  // Try to submit, expect error
  cy.testId('formButton-submit').click();
  cy.testId('formErrorAlert')
    .contains('Inventory start date must be on or after project start date')
    .should('exist');

  // Fix start date and submit again
  cy.inputId('2.07.1').clear().safeType('06/01/2022');
  cy.testId('formButton-submit').click();
  cy.testId('loading').should('not.exist');
  cy.tableRows('inventoryCard').should('have.length', 2);

  // Delete an Inventory record
  cy.tableRows('inventoryCard').first().click();
  cy.testId('deleteRecordButton-inventory').click();
  cy.confirmDialog();
  cy.testId('loading').should('not.exist');
  cy.tableRows('inventoryCard').should('have.length', 1);

  /*** Close project (should warn about open funders) ***/
  cy.navItem('overview').click();
  cy.testId('updateProjectButton').click();
  cy.inputId('2.02.4').clear().safeType('01/31/2022');
  cy.testId('formButton-submit').click();
  cy.confirmDialog();

  /*** Delete project ***/
  cy.testId('updateProjectButton').click();
  cy.testId('deleteRecordButton-project').click();
  cy.confirmDialog();
});
