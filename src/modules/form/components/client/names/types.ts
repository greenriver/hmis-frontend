import { ClientNameObjectFieldsFragment } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

export type NameInputType = PartialPick<
  ClientNameObjectFieldsFragment,
  'id'
> & { _key?: string };
