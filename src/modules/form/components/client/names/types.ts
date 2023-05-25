import { ClientNameObjectFieldsFragment } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

export type NameInputType = PartialPick<
  Omit<ClientNameObjectFieldsFragment, 'dateUpdated' | 'dateCreated'>,
  'id'
> & { _key?: string };
