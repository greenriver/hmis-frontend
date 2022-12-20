/// <reference types="cypress" />

// https://www.hudexchange.info/programs/hmis/hmis-data-standards/standards/Universal_Data_Elements.htm

// 3.917 Prior Living Situation
Cypress.Commands.add('assertPriorLivingSituation', () => {
  // Messages shown if a "break" happens
  const breakInstitutional = '3.917.A';
  const breakPermanent = '3.917.B';
  const breakLast = '3.917.C.message';

  // These should be hidden if we have an earlier "break"
  const threeFourFive = ['3.917.3', '3.917.4', '3.917.5'];

  // Institutional 90+ days
  cy.choose('3.917.1', 'FOSTER_CARE_HOME_OR_FOSTER_CARE_GROUP_HOME');
  cy.choose('3.917.2', 'NUM_90_DAYS_OR_MORE_BUT_LESS_THAN_ONE_YEAR');
  cy.displayItem(breakInstitutional).should('exist');
  cy.displayItems([breakPermanent, breakLast]).should('not.exist');
  cy.getByIds(threeFourFive).should('not.exist');
  cy.choose('3.917.2', 'ONE_YEAR_OR_LONGER');
  cy.displayItem(breakInstitutional).should('exist');
  cy.displayItems([breakPermanent, breakLast]).should('not.exist');
  cy.getByIds(threeFourFive).should('not.exist');

  // Reset
  cy.choose('3.917.2', 'ONE_MONTH_OR_MORE_BUT_LESS_THAN_90_DAYS');
  cy.displayItems([breakInstitutional, breakPermanent, breakLast]).should(
    'not.exist'
  );
  cy.getByIds(threeFourFive).should('exist');

  // Temp/permanent 7+ days
  cy.choose('3.917.1', 'HOST_HOME_NON_CRISIS');
  cy.displayItem(breakPermanent).should('exist');
  cy.displayItems([breakInstitutional, breakLast]).should('not.exist');

  cy.choose('3.917.2', 'ONE_WEEK_OR_MORE_BUT_LESS_THAN_ONE_MONTH');
  cy.displayItem(breakPermanent).should('exist');
  cy.displayItems([breakInstitutional, breakLast]).should('not.exist');

  cy.choose('3.917.2', 'NUM_90_DAYS_OR_MORE_BUT_LESS_THAN_ONE_YEAR');
  cy.displayItem(breakPermanent).should('exist');
  cy.displayItems([breakInstitutional, breakLast]).should('not.exist');

  cy.choose('3.917.2', 'ONE_YEAR_OR_LONGER');
  cy.displayItem(breakPermanent).should('exist');
  cy.displayItems([breakInstitutional, breakLast]).should('not.exist');

  cy.getById('3.917.C').should('not.exist');

  // Reset
  cy.choose('3.917.2', 'TWO_TO_SIX_NIGHTS');
  cy.displayItems([breakInstitutional, breakPermanent, breakLast]).should(
    'not.exist'
  );
  cy.getByIds(threeFourFive).should('exist');

  // Stop data collection if not homeless on night before
  cy.getById('3.917.C').get('button[value="false"]').click();
  cy.displayItem(breakLast).should('exist');
  cy.displayItems([breakInstitutional, breakPermanent]).should('not.exist');
  cy.getByIds(threeFourFive).should('not.exist');

  // Re-enable
  cy.getById('3.917.C').get('button[value="true"]').click();
  cy.displayItems([breakInstitutional, breakPermanent, breakLast]).should(
    'not.exist'
  );
  cy.getByIds(threeFourFive).should('exist');
});

Cypress.Commands.add('assertIncomeAndSources', () => {});
