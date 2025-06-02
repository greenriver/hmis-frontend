import adminReferralPosting from '@/modules/form/data/adminReferralPosting.json';
import referralPosting from '@/modules/form/data/referralPosting.json';
import search from '@/modules/form/data/search.json';
import { FormDefinitionJsonFieldsFragment } from '@/types/gqlTypes';

export const SearchFormDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(search));

export const ReferralPostingDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(referralPosting));

export const AdminReferralPostingDefinition: FormDefinitionJsonFieldsFragment =
  JSON.parse(JSON.stringify(adminReferralPosting));
