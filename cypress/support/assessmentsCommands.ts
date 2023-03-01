/// <reference types="cypress" />

import { mapValues } from 'lodash-es';

import {
  AlphaIncomeSources,
  EmptyDisabilityGroup,
  EmptyIncomeSources,
  EmptyInsurance,
  EmptyNonCashBenefits,
  EmptyPriorLivingSituation,
  HIDDEN,
} from './assessmentConstants';
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
  const hiddenThreeFourFive = {
    'Enrollment.dateToStreetEssh': HIDDEN,
    'Enrollment.timesHomelessPastThreeYears': HIDDEN,
    'Enrollment.monthsHomelessPastThreeYears': HIDDEN,
  };

  // Ensure losUnderThreshold doesn't get populated if no LOS is selected
  cy.choose('3.917.1', 'FOSTER_CARE_HOME_OR_FOSTER_CARE_GROUP_HOME');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyPriorLivingSituation,
    'Enrollment.livingSituation': 'FOSTER_CARE_HOME_OR_FOSTER_CARE_GROUP_HOME',
  });

  // Fill in some dependent fields before testing breaks, so that we can ensure they don't end up in the HUD result
  cy.inputId('3.917.3').type('01012022'); // date to street essh
  cy.choose('3.917.4', 'ONE_TIME'); // times homeless
  cy.choose('3.917.5', 'NUM_4'); // months homeless

  // Institutional 90+ days (break)
  cy.choose('3.917.1', 'FOSTER_CARE_HOME_OR_FOSTER_CARE_GROUP_HOME');
  cy.choose('3.917.2', 'NUM_90_DAYS_OR_MORE_BUT_LESS_THAN_ONE_YEAR');
  cy.displayItem(breakInstitutional).should('exist');
  cy.displayItems([breakPermanent, breakLast]).should('not.exist');
  cy.getByIds(threeFourFive).should('not.exist');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyPriorLivingSituation,
    ...hiddenThreeFourFive,
    'Enrollment.previousStreetEssh': HIDDEN,
    'Enrollment.livingSituation': 'FOSTER_CARE_HOME_OR_FOSTER_CARE_GROUP_HOME',
    'Enrollment.lengthOfStay': 'NUM_90_DAYS_OR_MORE_BUT_LESS_THAN_ONE_YEAR',
    'Enrollment.losUnderThreshold': false,
  });

  // Institutional 1+ year (break)
  cy.choose('3.917.2', 'ONE_YEAR_OR_LONGER');
  cy.displayItem(breakInstitutional).should('exist');
  cy.displayItems([breakPermanent, breakLast]).should('not.exist');
  cy.getByIds(threeFourFive).should('not.exist');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyPriorLivingSituation,
    ...hiddenThreeFourFive,
    'Enrollment.previousStreetEssh': HIDDEN,
    'Enrollment.livingSituation': 'FOSTER_CARE_HOME_OR_FOSTER_CARE_GROUP_HOME',
    'Enrollment.lengthOfStay': 'ONE_YEAR_OR_LONGER',
    'Enrollment.losUnderThreshold': false,
  });

  // Reset
  cy.choose('3.917.2', 'ONE_MONTH_OR_MORE_BUT_LESS_THAN_90_DAYS');
  cy.displayItems([breakInstitutional, breakPermanent, breakLast]).should(
    'not.exist'
  );
  cy.getByIds(threeFourFive).should('exist');

  // Temp/permanent 7+ days (break)
  cy.choose('3.917.1', 'HOST_HOME_NON_CRISIS');
  cy.displayItem(breakPermanent).should('exist');
  cy.displayItems([breakInstitutional, breakLast]).should('not.exist');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyPriorLivingSituation,
    ...hiddenThreeFourFive,
    'Enrollment.previousStreetEssh': HIDDEN,
    'Enrollment.livingSituation': 'HOST_HOME_NON_CRISIS',
    'Enrollment.lengthOfStay': 'ONE_MONTH_OR_MORE_BUT_LESS_THAN_90_DAYS',
    'Enrollment.losUnderThreshold': false,
  });

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
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyPriorLivingSituation,
    'Enrollment.livingSituation': 'HOST_HOME_NON_CRISIS',
    'Enrollment.lengthOfStay': 'TWO_TO_SIX_NIGHTS',
    // its not a break (it IS under the treshold)
    'Enrollment.losUnderThreshold': true,
    // previously filled in dependent fields are present
    'Enrollment.dateToStreetEssh': '2022-01-01',
    'Enrollment.timesHomelessPastThreeYears': 'ONE_TIME',
    'Enrollment.monthsHomelessPastThreeYears': 'NUM_4',
  });

  // Set previousStreetEssh to false, causing break to appear
  cy.checkOption('3.917.C', 'false');
  cy.displayItem(breakLast).should('exist');
  cy.displayItems([breakInstitutional, breakPermanent]).should('not.exist');
  cy.getByIds(threeFourFive).should('not.exist');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyPriorLivingSituation,
    ...hiddenThreeFourFive,
    'Enrollment.livingSituation': 'HOST_HOME_NON_CRISIS',
    'Enrollment.lengthOfStay': 'TWO_TO_SIX_NIGHTS',
    'Enrollment.losUnderThreshold': true,
    'Enrollment.previousStreetEssh': false,
  });

  // Set previousStreetEssh to true, causing break to disappear
  cy.checkOption('3.917.C', 'true');
  cy.displayItems([breakInstitutional, breakPermanent, breakLast]).should(
    'not.exist'
  );
  cy.getByIds(threeFourFive).should('exist');

  const expectedHudValues = {
    'Enrollment.livingSituation': 'HOST_HOME_NON_CRISIS',
    'Enrollment.lengthOfStay': 'TWO_TO_SIX_NIGHTS',
    'Enrollment.losUnderThreshold': true,
    'Enrollment.previousStreetEssh': true,
    'Enrollment.dateToStreetEssh': '2022-01-01',
    'Enrollment.timesHomelessPastThreeYears': 'ONE_TIME',
    'Enrollment.monthsHomelessPastThreeYears': 'NUM_4',
  };
  cy.expectHudValuesSectionToDeepEqual(expectedHudValues);

  // Disabling should remove values
  cy.checkOption('3.917.C', 'false');
  cy.getByIds(threeFourFive).should('not.exist');

  // Re-enabling should add back old values (make previousStreetEssh null)
  cy.checkOption('3.917.C', 'false'); // un-check
  cy.expectHudValuesSectionToDeepEqual({
    ...expectedHudValues,
    'Enrollment.previousStreetEssh': null,
  });
});

/**
 * Income and Sources
 */
Cypress.Commands.add('assertIncomeAndSources', () => {
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
  AlphaIncomeSources.forEach((letter) => {
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
    .contains(incomePerSource * (AlphaIncomeSources.length + 1))
    .should('exist');

  const expectedHudValues = {
    ...EmptyInsurance,
    ...EmptyNonCashBenefits,
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
  cy.expectHudValuesSectionToDeepEqual(expectedHudValues);

  // When disabled, all income values should be removed from hudValues
  cy.checkOption(fromAnySource, 'NO');
  cy.getById(inputGroup).should('not.exist');

  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyInsurance,
    ...EmptyNonCashBenefits,
    ...mapValues(EmptyIncomeSources, () => HIDDEN),
    'IncomeBenefit.incomeFromAnySource': 'NO',
  });

  // When re-enabled, old income values should be added back
  cy.checkOption(fromAnySource, 'YES');
  cy.expectHudValuesSectionToDeepEqual(expectedHudValues);
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

  cy.expectHudValuesToInclude({
    ...mapValues(EmptyNonCashBenefits, () => HIDDEN),
    'IncomeBenefit.benefitsFromAnySource': 'NO',
  });

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

  cy.expectHudValuesToInclude({
    ...mapValues(EmptyInsurance, () => HIDDEN),
    'IncomeBenefit.insuranceFromAnySource': 'NO',
  });

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

  const overallCondition = '3.08';
  cy.getById(overallCondition).should('not.have.value');

  // Physical
  cy.getById('4.05.A').should('be.disabled');
  cy.choose('4.05.2', 'NO');
  cy.getById('4.05.A').should('be.disabled');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.choose('4.05.2', 'YES');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.getById('4.05.A').should('be.enabled');
  cy.choose('4.05.A', 'YES');
  cy.getById(overallCondition).should('have.value', 'Yes');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.physicalDisability': 'YES',
    'DisabilityGroup.physicalDisabilityIndefiniteAndImpairs': 'YES',
    'DisabilityGroup.disablingCondition': 'YES',
  });

  // Clear
  cy.getById('disability').findTestId('clearButton').click();
  cy.getById(overallCondition).should('not.have.value');

  // Developmental
  cy.choose('4.06.2', 'NO');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.choose('4.06.2', 'YES');
  cy.getById(overallCondition).should('have.value', 'Yes');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.developmentalDisability': 'YES',
    'DisabilityGroup.disablingCondition': 'YES',
  });

  // Clear
  cy.getById('disability').findTestId('clearButton').click();
  cy.getById(overallCondition).should('not.have.value');

  // Chronic
  cy.getById('4.07.A').should('be.disabled');
  cy.choose('4.07.2', 'NO');
  cy.getById('4.07.A').should('be.disabled');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.choose('4.07.2', 'YES');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.getById('4.07.A').should('be.enabled');
  cy.choose('4.07.A', 'YES');
  cy.getById(overallCondition).should('have.value', 'Yes');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.chronicHealthCondition': 'YES',
    'DisabilityGroup.chronicHealthConditionIndefiniteAndImpairs': 'YES',
    'DisabilityGroup.disablingCondition': 'YES',
  });
  // Clear
  cy.getById('disability').findTestId('clearButton').click();
  cy.getById(overallCondition).should('not.have.value');

  // HIV/AIDS
  cy.choose('4.08.2', 'NO');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.choose('4.08.2', 'YES');
  cy.getById(overallCondition).should('have.value', 'Yes');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.hivAids': 'YES',
    'DisabilityGroup.disablingCondition': 'YES',
  });

  // Clear
  cy.getById('disability').findTestId('clearButton').click();
  cy.getById(overallCondition).should('not.have.value');

  // Mental Health
  cy.getById('4.09.A').should('be.disabled');
  cy.choose('4.09.2', 'NO');
  cy.getById('4.09.A').should('be.disabled');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.choose('4.09.2', 'YES');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.getById('4.09.A').should('not.be.disabled');
  cy.getById('4.09.A').should('be.enabled');
  cy.choose('4.09.A', 'YES');
  cy.getById(overallCondition).should('have.value', 'Yes');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.mentalHealthDisorder': 'YES',
    'DisabilityGroup.mentalHealthDisorderIndefiniteAndImpairs': 'YES',
    'DisabilityGroup.disablingCondition': 'YES',
  });

  // Clear
  cy.getById('disability').findTestId('clearButton').click();
  cy.getById(overallCondition).should('not.have.value');

  // Substance Use
  cy.getById('4.10.A').should('be.disabled');
  cy.choose('4.10.2', 'NO');
  cy.getById('4.10.A').should('be.disabled');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.choose('4.10.2', 'DRUG_USE_DISORDER');
  cy.getById(overallCondition).should('have.value', 'No');
  cy.getById('4.10.A').should('be.enabled');
  cy.choose('4.10.A', 'YES');
  cy.getById(overallCondition).should('have.value', 'Yes');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.substanceUseDisorder': 'DRUG_USE_DISORDER',
    'DisabilityGroup.substanceUseDisorderIndefiniteAndImpairs': 'YES',
    'DisabilityGroup.disablingCondition': 'YES',
  });

  // Clear
  cy.getById('disability').findTestId('clearButton').click();
  cy.getById(overallCondition).should('not.have.value');

  // Test overriding system-generated NO with YES
  cy.choose('4.07.2', 'YES'); // chronic health
  cy.choose('4.09.2', 'YES'); // mental health
  cy.getById(overallCondition).should('have.value', 'No');
  cy.choose(overallCondition, 'YES');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.chronicHealthCondition': 'YES',
    'DisabilityGroup.chronicHealthConditionIndefiniteAndImpairs': null,
    'DisabilityGroup.mentalHealthDisorder': 'YES',
    'DisabilityGroup.mentalHealthDisorderIndefiniteAndImpairs': null,
    'DisabilityGroup.disablingCondition': 'YES',
  });
  cy.getById(overallCondition).clear();
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.chronicHealthCondition': 'YES',
    'DisabilityGroup.chronicHealthConditionIndefiniteAndImpairs': null,
    'DisabilityGroup.mentalHealthDisorder': 'YES',
    'DisabilityGroup.mentalHealthDisorderIndefiniteAndImpairs': null,
    'DisabilityGroup.disablingCondition': null,
  });
  cy.choose(overallCondition, 'NO');
  cy.expectHudValuesSectionToDeepEqual({
    ...EmptyDisabilityGroup,
    'DisabilityGroup.chronicHealthCondition': 'YES',
    'DisabilityGroup.chronicHealthConditionIndefiniteAndImpairs': null,
    'DisabilityGroup.mentalHealthDisorder': 'YES',
    'DisabilityGroup.mentalHealthDisorderIndefiniteAndImpairs': null,
    'DisabilityGroup.disablingCondition': 'NO',
  });
});

/**
 * Health and DV
 */
Cypress.Commands.add('assertHealthAndDV', () => {
  cy.testId('formNavTo-health-and-dv').click();

  // Some questions initially disabled
  cy.inputId('4.11.A').should('be.disabled');
  cy.getById('4.11.B').find('input').should('be.disabled');

  cy.expectHudValuesSectionToDeepEqual({
    'HealthAndDv.domesticViolenceVictim': null,
    'HealthAndDv.whenOccurred': HIDDEN,
    'HealthAndDv.currentlyFleeing': HIDDEN,
  });
  // Fill out
  cy.checkOption('4.11.2', 'YES');
  cy.expectHudValuesSectionToDeepEqual({
    'HealthAndDv.domesticViolenceVictim': 'YES',
    'HealthAndDv.whenOccurred': null,
    'HealthAndDv.currentlyFleeing': null,
  });
  cy.choose('4.11.A', 'ONE_YEAR_OR_MORE');
  cy.checkOption('4.11.B', 'CLIENT_REFUSED');
  const expectedValues = {
    'HealthAndDv.domesticViolenceVictim': 'YES',
    'HealthAndDv.whenOccurred': 'ONE_YEAR_OR_MORE',
    'HealthAndDv.currentlyFleeing': 'CLIENT_REFUSED',
  };
  cy.expectHudValuesSectionToDeepEqual(expectedValues);

  // Disabling should hide values
  cy.checkOption('4.11.2', 'CLIENT_REFUSED');
  cy.inputId('4.11.A').should('be.disabled').should('not.have.value');
  cy.getById('4.11.B')
    .find('input')
    .should('be.disabled')
    .should('not.have.value');

  cy.expectHudValuesSectionToDeepEqual({
    'HealthAndDv.domesticViolenceVictim': 'CLIENT_REFUSED',
    'HealthAndDv.whenOccurred': HIDDEN,
    'HealthAndDv.currentlyFleeing': HIDDEN,
  });

  // Re-enabling should add back old saved values
  cy.checkOption('4.11.2', 'YES');
  cy.inputId('4.11.A')
    .should('not.be.disabled')
    .should('have.value', 'One year or more');
  cy.getById('4.11.B').find('input').should('not.be.disabled');
  cy.expectHudValuesSectionToDeepEqual(expectedValues);
});
