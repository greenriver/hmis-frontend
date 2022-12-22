/// <reference types="cypress" />

// https://www.hudexchange.info/programs/hmis/hmis-data-standards/standards/Universal_Data_Elements.htm

// 3.917 Prior Living Situation
Cypress.Commands.add('assertPriorLivingSituation', () => {
  cy.testId('formNavTo-prior-living-situation').click();

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
  cy.getById('3.917.C').find('button[value="false"]').click();
  cy.displayItem(breakLast).should('exist');
  cy.displayItems([breakInstitutional, breakPermanent]).should('not.exist');
  cy.getByIds(threeFourFive).should('not.exist');

  // Re-enable
  cy.getById('3.917.C').find('button[value="true"]').click();
  cy.displayItems([breakInstitutional, breakPermanent, breakLast]).should(
    'not.exist'
  );
  cy.getByIds(threeFourFive).should('exist');

  // TODO: fill in date picker and remaining
  // TODO: assert hud values
});

Cypress.Commands.add('assertIncomeAndSources', () => {
  const ALPHA_INCOME_SOURCES = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
  ];
  const INCOME_PER_SOURCE = 5;

  cy.testId('formNavTo-income-and-sources').click();
  cy.getById('income-sources-group').should('exist');

  cy.checkOption('4.02.2', 'CLIENT_REFUSED');
  cy.getById('income-sources-group').should('not.exist');
  cy.checkOption('4.02.2', 'NO');
  cy.getById('income-sources-group').should('not.exist');

  // Un-check NO to make rest of form appear again
  cy.checkOption('4.02.2', 'NO');
  cy.getById('income-sources-group').should('exist');
  cy.getChecked('4.02.2').should('not.exist');

  // Fill in number for each income source
  ALPHA_INCOME_SOURCES.forEach((letter) => {
    // Ensure that YES is auto-selected when value is entered
    cy.inputId(`4.02.${letter}`).type(INCOME_PER_SOURCE.toString());
    cy.getChecked('4.02.2', 'YES').should('exist');

    // uncheck
    cy.uncheckOption('4.02.2', 'YES');
    cy.getChecked('4.02.2').should('not.exist');
  });

  // Fill in "Other" source
  cy.inputId(`4.02.O`).type(INCOME_PER_SOURCE.toString());
  cy.inputId(`4.02.P`).type('other description');
  cy.getChecked('4.02.2', 'YES').should('exist');

  cy.getById('income-sources-group')
    .findTestId('inputSum')
    .contains(INCOME_PER_SOURCE * (ALPHA_INCOME_SOURCES.length + 1))
    .should('exist');

  cy.expectHudValuesToInclude({
    'IncomeBenefit.incomeFromAnySource': 'YES',
    'IncomeBenefit.earned': true,
    'IncomeBenefit.earnedAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.unemployment': true,
    'IncomeBenefit.unemploymentAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.ssi': true,
    'IncomeBenefit.ssiAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.ssdi': true,
    'IncomeBenefit.ssdiAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.vaDisabilityService': true,
    'IncomeBenefit.vaDisabilityServiceAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.vaDisabilityNonService': true,
    'IncomeBenefit.vaDisabilityNonServiceAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.privateDisability': true,
    'IncomeBenefit.privateDisabilityAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.workersComp': true,
    'IncomeBenefit.workersCompAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.tanf': true,
    'IncomeBenefit.tanfAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.ga': true,
    'IncomeBenefit.gaAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.socSecRetirement': true,
    'IncomeBenefit.socSecRetirementAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.pension': true,
    'IncomeBenefit.pensionAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.childSupport': true,
    'IncomeBenefit.childSupportAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.alimony': true,
    'IncomeBenefit.alimonyAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.otherIncomeSource': true,
    'IncomeBenefit.otherIncomeAmount': INCOME_PER_SOURCE,
    'IncomeBenefit.otherIncomeSourceIdentify': 'other description',
  });

  // When disabled, all income values should be removed from hudValues
  cy.checkOption('4.02.2', 'NO');
  cy.getById('income-sources-group').should('not.exist');

  cy.expectHudValuesToInclude({ 'IncomeBenefit.incomeFromAnySource': 'NO' });
  cy.expectHudValuesToNotHaveKeys([
    'IncomeBenefit.earned',
    'IncomeBenefit.earnedAmount',
    'IncomeBenefit.otherIncomeSource',
    'IncomeBenefit.otherIncomeAmount',
    'IncomeBenefit.otherIncomeSourceIdentify',
  ]);
});

Cypress.Commands.add('assertNonCashBenefits', () => {});
Cypress.Commands.add('assertHealthInsurance', () => {});
Cypress.Commands.add('assertDisability', () => {});
Cypress.Commands.add('assertHealthAndDV', () => {});
