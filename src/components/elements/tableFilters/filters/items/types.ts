import { SelectElementVariant } from '@/modules/dataFetching/types';
import { PickListOption } from '@/types/gqlTypes';

export interface TableFilterItemSelectorProps {
  variant?: SelectElementVariant;
  options: PickListOption[];
  value: string | string[] | null | undefined;
  onChange: (value: string | string[] | null | undefined) => any;
  loading?: boolean;
  placeholder?: string;
}
