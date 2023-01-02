/// <reference types="cypress" />

// https://www.hudexchange.info/programs/hmis/hmis-data-standards/standards/Universal_Data_Elements.htm

/**
 * 3.917 Prior Living Situation
 */
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

  // Fill in DateToStreetESSH and times/months homeless
  cy.inputId('3.917.3').type('01012022');
  cy.choose('3.917.4', 'ONE_TIME');
  cy.choose('3.917.5', 'NUM_4');

  const expectedHudValues = {
    'Enrollment.livingSituation': 'HOST_HOME_NON_CRISIS',
    'Enrollment.lengthOfStay': 'TWO_TO_SIX_NIGHTS',
    'Enrollment.previousStreetEssh': true,
    'Enrollment.dateToStreetEssh': '2022-01-01',
    'Enrollment.timesHomelessPastThreeYears': 'ONE_TIME',
    'Enrollment.monthsHomelessPastThreeYears': 'NUM_4',
  };
  cy.expectHudValuesToInclude(expectedHudValues);

  // Disabling should remove values
  cy.getById('3.917.C').find('button[value="false"]').click();
  cy.getByIds(threeFourFive).should('not.exist');
  cy.expectHudValuesToNotHaveKeys([
    'Enrollment.dateToStreetEssh',
    'Enrollment.timesHomelessPastThreeYears',
    'Enrollment.monthsHomelessPastThreeYears',
  ]);

  // Re-enabling should add back old values (make previousStreetEssh null)
  cy.getById('3.917.C').find('button[value="false"]').click();
  cy.expectHudValuesToInclude({
    ...expectedHudValues,
    'Enrollment.previousStreetEssh': null,
  });

  // Make previousStreetEssh true
  // cy.getById('3.917.C').find('button[value="true"]').click();
  // cy.expectHudValuesToInclude(expectedHudValues);
});

/**
 * Income and Sources
 */
Cypress.Commands.add('assertIncomeAndSources', () => {
  const alphaIncomeSources = [
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
  const incomePerSource = 5;
  const fromAnySource = '4.02.2';
  const inputGroup = 'income-sources-group';

  cy.testId('formNavTo-income-and-sources').click();
  cy.getById(inputGroup).should('exist');

  cy.checkOption(fromAnySource, 'CLIENT_REFUSED');
  cy.getById(inputGroup).should('not.exist');
  cy.checkOption(fromAnySource, 'CLIENT_DOESN_T_KNOW');
  cy.getById(inputGroup).should('not.exist');
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('not.exist');

  // Un-check NO to make rest of form appear again
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('exist');
  cy.getChecked(fromAnySource).should('not.exist');

  // Fill in number for each income source
  alphaIncomeSources.forEach((letter) => {
    // Ensure that YES is auto-selected when value is entered
    cy.inputId(`4.02.${letter}`).type(incomePerSource.toString());
    cy.getChecked(fromAnySource, 'YES').should('exist');

    // uncheck
    cy.uncheckOption(fromAnySource, 'YES');
    cy.getChecked(fromAnySource).should('not.exist');
  });

  // Fill in "Other" source
  cy.inputId(`4.02.O`).type(incomePerSource.toString());
  cy.inputId(`4.02.P`).type('other description');
  cy.getChecked(fromAnySource, 'YES').should('exist');

  cy.getById(inputGroup)
    .findTestId('inputSum')
    .contains(incomePerSource * (alphaIncomeSources.length + 1))
    .should('exist');

  const expectedHudValues = {
    'IncomeBenefit.incomeFromAnySource': 'YES',
    'IncomeBenefit.earned': true,
    'IncomeBenefit.earnedAmount': incomePerSource,
    'IncomeBenefit.unemployment': true,
    'IncomeBenefit.unemploymentAmount': incomePerSource,
    'IncomeBenefit.ssi': true,
    'IncomeBenefit.ssiAmount': incomePerSource,
    'IncomeBenefit.ssdi': true,
    'IncomeBenefit.ssdiAmount': incomePerSource,
    'IncomeBenefit.vaDisabilityService': true,
    'IncomeBenefit.vaDisabilityServiceAmount': incomePerSource,
    'IncomeBenefit.vaDisabilityNonService': true,
    'IncomeBenefit.vaDisabilityNonServiceAmount': incomePerSource,
    'IncomeBenefit.privateDisability': true,
    'IncomeBenefit.privateDisabilityAmount': incomePerSource,
    'IncomeBenefit.workersComp': true,
    'IncomeBenefit.workersCompAmount': incomePerSource,
    'IncomeBenefit.tanf': true,
    'IncomeBenefit.tanfAmount': incomePerSource,
    'IncomeBenefit.ga': true,
    'IncomeBenefit.gaAmount': incomePerSource,
    'IncomeBenefit.socSecRetirement': true,
    'IncomeBenefit.socSecRetirementAmount': incomePerSource,
    'IncomeBenefit.pension': true,
    'IncomeBenefit.pensionAmount': incomePerSource,
    'IncomeBenefit.childSupport': true,
    'IncomeBenefit.childSupportAmount': incomePerSource,
    'IncomeBenefit.alimony': true,
    'IncomeBenefit.alimonyAmount': incomePerSource,
    'IncomeBenefit.otherIncomeSource': true,
    'IncomeBenefit.otherIncomeAmount': incomePerSource,
    'IncomeBenefit.otherIncomeSourceIdentify': 'other description',
  };
  cy.expectHudValuesToInclude(expectedHudValues);

  // When disabled, all income values should be removed from hudValues
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('not.exist');

  cy.expectHudValuesToInclude({ 'IncomeBenefit.incomeFromAnySource': 'NO' });
  cy.expectHudValuesToNotHaveKeys([
    'IncomeBenefit.earned',
    'IncomeBenefit.earnedAmount',
    'IncomeBenefit.otherIncomeSource',
    'IncomeBenefit.otherIncomeAmount',
    'IncomeBenefit.otherIncomeSourceIdentify',
  ]);

  // When re-enabled, old income values should be added back
  cy.checkOption(fromAnySource, 'YES');
  cy.expectHudValuesToInclude(expectedHudValues);
});

/**
 * Non-Cash Benefits
 */
Cypress.Commands.add('assertNonCashBenefits', () => {
  const fromAnySource = '4.03.2';
  const inputGroup = 'non-cash-benefits-group';

  cy.testId('formNavTo-non-cash-benefits').click();
  cy.getById(inputGroup).should('exist');

  cy.checkOption(fromAnySource, 'CLIENT_REFUSED');
  cy.getById(inputGroup).should('not.exist');
  cy.checkOption(fromAnySource, 'CLIENT_DOESN_T_KNOW');
  cy.getById(inputGroup).should('not.exist');
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('not.exist');

  // Un-check NO to make rest of form appear again
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('exist');
  cy.getChecked(fromAnySource).should('not.exist');

  // Check each option
  Array.from(Array(5).keys()).forEach((i) => {
    // Ensure that YES is auto-selected when benefit is checked
    cy.getById(`4.03.${i + 3}`)
      .find('input')
      .check();
    cy.getChecked(fromAnySource, 'YES').should('exist');

    // Uncheck "from any source"
    cy.uncheckOption(fromAnySource, 'YES');
    cy.getChecked(fromAnySource).should('not.exist');
  });

  // Fill in "Other" source
  cy.getById(`4.03.8`).find('input').check();
  cy.inputId(`4.03.A`).type('other description');
  cy.getChecked(fromAnySource, 'YES').should('exist');

  const expectedHudValues = {
    'IncomeBenefit.benefitsFromAnySource': 'YES',
    'IncomeBenefit.snap': true,
    'IncomeBenefit.wic': true,
    'IncomeBenefit.tanfChildCare': true,
    'IncomeBenefit.tanfTransportation': true,
    'IncomeBenefit.otherTanf': true,
    'IncomeBenefit.otherBenefitsSource': true,
    'IncomeBenefit.otherBenefitsSourceIdentify': 'other description',
  };
  cy.expectHudValuesToInclude(expectedHudValues);

  // When disabled, all income values should be removed from hudValues
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('not.exist');

  cy.expectHudValuesToInclude({ 'IncomeBenefit.benefitsFromAnySource': 'NO' });
  cy.expectHudValuesToNotHaveKeys([
    'IncomeBenefit.snap',
    'IncomeBenefit.wic',
    'IncomeBenefit.tanfChildCare',
    'IncomeBenefit.tanfTransportation',
    'IncomeBenefit.otherTanf',
    'IncomeBenefit.otherBenefitsSource',
    'IncomeBenefit.otherBenefitsSourceIdentify',
  ]);

  // When re-enabled, old income values should be added back
  cy.checkOption(fromAnySource, 'YES');
  cy.expectHudValuesToInclude(expectedHudValues);

  // Un-check WIC should save it as "false"
  cy.getById(`4.03.4`).find('input').uncheck();
  cy.expectHudValuesToInclude({
    ...expectedHudValues,
    'IncomeBenefit.wic': false,
  });
});

/**
 * Health Insurance
 */
Cypress.Commands.add('assertHealthInsurance', () => {
  const inputGroup = 'health-insurance-group';
  const fromAnySource = '4.04.2';

  cy.testId('formNavTo-health-insurance').click();
  cy.getById(inputGroup).should('exist');

  cy.checkOption(fromAnySource, 'CLIENT_REFUSED');
  cy.getById(inputGroup).should('not.exist');
  cy.checkOption(fromAnySource, 'CLIENT_DOESN_T_KNOW');
  cy.getById(inputGroup).should('not.exist');
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('not.exist');

  // Un-check NO to make rest of form appear again
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('exist');
  cy.getChecked(fromAnySource).should('not.exist');

  // Check each option
  Array.from(Array(9).keys()).forEach((i) => {
    // Ensure that YES is auto-selected when benefit is checked
    cy.getById(`4.04.${i + 3}`)
      .find('input')
      .check();
    cy.getChecked(fromAnySource, 'YES').should('exist');

    // Uncheck "from any source"
    cy.uncheckOption(fromAnySource, 'YES');
    cy.getChecked(fromAnySource).should('not.exist');
  });

  // Fill in "Other" source
  cy.getById(`4.04.12`).find('input').check();
  cy.inputId(`4.04.12A`).type('other description');
  cy.getChecked(fromAnySource, 'YES').should('exist');

  const expectedHudValues = {
    'IncomeBenefit.insuranceFromAnySource': 'YES',
    'IncomeBenefit.medicaid': true,
    'IncomeBenefit.medicare': true,
    'IncomeBenefit.schip': true,
    'IncomeBenefit.vaMedicalServices': true,
    'IncomeBenefit.employerProvided': true,
    'IncomeBenefit.cobra': true,
    'IncomeBenefit.privatePay': true,
    'IncomeBenefit.stateHealthIns': true,
    'IncomeBenefit.indianHealthServices': true,
    'IncomeBenefit.otherInsurance': true,
    'IncomeBenefit.otherInsuranceIdentify': 'other description',
  };
  cy.expectHudValuesToInclude(expectedHudValues);

  // When disabled, all income values should be removed from hudValues
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('not.exist');

  cy.expectHudValuesToInclude({ 'IncomeBenefit.insuranceFromAnySource': 'NO' });
  cy.expectHudValuesToNotHaveKeys([
    'IncomeBenefit.medicaid',
    'IncomeBenefit.medicare',
    'IncomeBenefit.schip',
    'IncomeBenefit.vaMedicalServices',
    'IncomeBenefit.employerProvided',
    'IncomeBenefit.cobra',
    'IncomeBenefit.privatePay',
    'IncomeBenefit.stateHealthIns',
    'IncomeBenefit.indianHealthServices',
    'IncomeBenefit.otherInsurance',
    'IncomeBenefit.otherInsuranceIdentify',
  ]);

  // When re-enabled, old income values should be added back
  cy.checkOption(fromAnySource, 'YES');
  cy.expectHudValuesToInclude(expectedHudValues);

  // Un-check Medicare should save it as "false"
  cy.getById(`4.04.4`).find('input').uncheck();
  cy.expectHudValuesToInclude({
    ...expectedHudValues,
    'IncomeBenefit.medicare': false,
  });
});

/**
 * Disabilities
 */
Cypress.Commands.add('assertDisability', () => {
  cy.testId('formNavTo-disability').click();
  // TODO implement!
  // Assert that inputs are enabled/disabled correctly
  // Assert that overall disabling condition is autofilled correctly
});

/**
 * Health and DV
 */
Cypress.Commands.add('assertHealthAndDV', () => {
  cy.testId('formNavTo-health-and-dv').click();

  // Some questions initially disabled
  cy.inputId('4.11.A').should('be.disabled');
  cy.getById('4.11.B').find('input').should('be.disabled');

  // Fill out
  cy.checkOption('4.11.2', 'YES');
  cy.choose('4.11.A', 'ONE_YEAR_OR_MORE');
  cy.checkOption('4.11.B', 'CLIENT_REFUSED');
  cy.expectHudValuesToInclude({
    'HealthAndDv.domesticViolenceVictim': 'YES',
    'HealthAndDv.whenOccurred': 'ONE_YEAR_OR_MORE',
    'HealthAndDv.currentlyFleeing': 'CLIENT_REFUSED',
  });

  // Disabling should hide values
  cy.checkOption('4.11.2', 'CLIENT_REFUSED');
  cy.inputId('4.11.A').should('be.disabled').should('not.have.value');
  cy.getById('4.11.B')
    .find('input')
    .should('be.disabled')
    .should('not.have.value');
  cy.expectHudValuesToInclude({
    'HealthAndDv.domesticViolenceVictim': 'CLIENT_REFUSED',
  });
  cy.expectHudValuesToNotHaveKeys([
    'HealthAndDv.whenOccurred',
    'HealthAndDv.currentlyFleeing',
  ]);

  // Re-enabling should add back old saved values
  cy.checkOption('4.11.2', 'YES');
  cy.inputId('4.11.A')
    .should('not.be.disabled')
    .should('have.value', 'One year or more');
  cy.getById('4.11.B').find('input').should('not.be.disabled');
  cy.expectHudValuesToInclude({
    'HealthAndDv.domesticViolenceVictim': 'YES',
    'HealthAndDv.whenOccurred': 'ONE_YEAR_OR_MORE',
    'HealthAndDv.currentlyFleeing': 'CLIENT_REFUSED',
  });
});
