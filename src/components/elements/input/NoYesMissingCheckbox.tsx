import { SyntheticEvent, useCallback } from 'react';

import LabeledCheckbox, {
  Props as LabeledCheckboxProps,
} from './LabeledCheckbox';

import { PickListOption } from '@/types/gqlTypes';

type Option = PickListOption;

interface Props extends Omit<LabeledCheckboxProps, 'onChange'> {
  value: any;
  onChange: (value: Option | null | undefined) => void;
}

const NoYesMissingCheckbox = ({ value, onChange, ...props }: Props) => {
  const onChangeWrapper = useCallback(
    (_e: SyntheticEvent, checked: boolean) => {
      onChange(checked ? { code: 'YES' } : { code: 'NO' });
    },
    [onChange]
  );

  return (
    <LabeledCheckbox
      checked={value?.code === 'YES'}
      onChange={onChangeWrapper}
      {...props}
    />
  );
};

export default NoYesMissingCheckbox;
