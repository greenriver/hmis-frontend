import adminReferralPosting from '@/modules/form/data/adminReferralPosting.json';
import beds from '@/modules/form/data/beds.json';
import outgoingReferralPosting from '@/modules/form/data/outgoingReferralPosting.json';
import referralPosting from '@/modules/form/data/referralPosting.json';
import search from '@/modules/form/data/search.json';
import units from '@/modules/form/data/units.json';
import { FormDefinitionJsonFieldsFragment } from '@/types/gqlTypes';

export const SearchFormDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(search));

export const BedsDefinition: FormDefinitionJsonFieldsFragment = JSON.parse(
  JSON.stringify(beds)
);

export const UnitsDefinition: FormDefinitionJsonFieldsFragment = JSON.parse(
  JSON.stringify(units)
);

export const OutgoingReferralPostingDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(outgoingReferralPosting));

export const ReferralPostingDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(referralPosting));

export const AdminReferralPostingDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(adminReferralPosting));
