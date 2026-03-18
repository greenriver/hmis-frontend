import { PickListOption } from '@/types/gqlTypes';
import { SelectElementVariant } from '@/types/tableFilterTypes';

export interface TableFilterItemSelectorProps {
  variant?: SelectElementVariant;
  options: PickListOption[];
  value: string | string[] | null | undefined;
  onChange: (value: string | string[] | null | undefined) => any;
  loading?: boolean;
  placeholder?: string;
}
