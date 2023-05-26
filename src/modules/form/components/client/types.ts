import {
  ClientNameObjectFieldsFragment,
  ClientAddressFieldsFragment,
} from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

export type NameInputType = PartialPick<
  Omit<ClientNameObjectFieldsFragment, 'dateCreated' | 'dateUpdated'>,
  'id'
> & { _key?: string };

export type AddressInputType = PartialPick<
  Omit<ClientAddressFieldsFragment, 'dateCreated' | 'dateUpdated'>,
  'id'
> & { _key?: string };
