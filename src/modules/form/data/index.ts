import adminReferralPosting from '@/modules/form/data/adminReferralPosting.json';
import annualAssessment from '@/modules/form/data/annualAssessment.json';
import currentLivingSituation from '@/modules/form/data/currentLivingSituation.json';
import mock from '@/modules/form/data/mock.json';
import referralPosting from '@/modules/form/data/referralPosting.json';
import search from '@/modules/form/data/search.json';
import service from '@/modules/form/data/service.json';
import units from '@/modules/form/data/units.json';
import { FormDefinitionJsonFieldsFragment } from '@/types/gqlTypes';

export const SearchFormDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(search));

export const UnitsDefinition: FormDefinitionJsonFieldsFragment = JSON.parse(
  JSON.stringify(units)
);

export const ReferralPostingDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(referralPosting));

export const AdminReferralPostingDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(adminReferralPosting));

export const AnnualAssessmentPostingDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(annualAssessment));

export const MockDefinition: FormDefinitionJsonFieldsFragment = JSON.parse(
  JSON.stringify(mock)
);

export const ServiceDefinition: FormDefinitionJsonFieldsFragment = JSON.parse(
  JSON.stringify(service)
);

export const ClsDefinition: FormDefinitionJsonFieldsFragment = JSON.parse(
  JSON.stringify(currentLivingSituation)
);
