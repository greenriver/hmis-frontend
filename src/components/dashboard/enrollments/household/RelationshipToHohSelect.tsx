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

  return (
    <GenericSelect<Option, false, false>
      options={relationshipToHohOptions}
      disabled={disabled}
      textInputProps={
        disabled
          ? { placeholder: 'Not Included' }
          : { placeholder: '(99) Data not collected' }
      }
      value={
        value ? relationshipToHohOptions.find((el) => el.value === value) : null
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
