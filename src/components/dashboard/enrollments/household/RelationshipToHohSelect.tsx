import { Typography } from '@mui/material';
import { omit, sortBy } from 'lodash-es';
import { useMemo } from 'react';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { RelationshipToHoHEnum } from '@/types/gqlEnums';
import { RelationshipToHoH } from '@/types/gqlTypes';

type Option = { value: RelationshipToHoH; label: string };

interface Props
  extends Omit<GenericSelectProps<Option, false, false>, 'options' | 'value'> {
  value: RelationshipToHoH | null;
}

const RelationshipToHohSelect = ({ disabled, value, ...props }: Props) => {
  const relationshipToHohOptions = useMemo(() => {
    const filtered = omit(RelationshipToHoHEnum, [
      RelationshipToHoH.DataNotCollected,
      RelationshipToHoH.SelfHeadOfHousehold,
    ]);
    const options = Object.entries(filtered).map(
      ([value, label]) =>
        ({
          value,
          label,
        } as Option)
    );
    return sortBy(options, ['label']);
  }, []);

  // disabled if HoH is selected
  const isHoH = value === RelationshipToHoH.SelfHeadOfHousehold;
  const isDisabled = disabled || isHoH;
  return (
    <GenericSelect<Option, false, false>
      options={relationshipToHohOptions}
      disabled={isDisabled}
      textInputProps={
        isDisabled
          ? { placeholder: isHoH ? '(1) Self' : 'Not Included' }
          : { placeholder: '(99) Data not collected' }
      }
      value={
        value && !isHoH
          ? relationshipToHohOptions.find((el) => el.value === value)
          : null
      }
      size='small'
      renderOption={(props, option) => (
        <li {...props} key={option.value}>
          <Typography variant='body2'>{option.label}</Typography>
        </li>
      )}
      fullWidth
      {...props}
    />
  );
};
export default RelationshipToHohSelect;
