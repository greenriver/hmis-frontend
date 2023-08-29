import { DynamicInputCommonProps } from '@/modules/form/types';

export interface MciClearanceProps extends DynamicInputCommonProps {
  value?: string | null;
  onChange: (value?: string | null) => void;
}
