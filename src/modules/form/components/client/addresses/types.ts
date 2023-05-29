import { ClientAddressFieldsFragment } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

export type AddressInputType = PartialPick<
  ClientAddressFieldsFragment,
  'id'
> & { _key?: string };
