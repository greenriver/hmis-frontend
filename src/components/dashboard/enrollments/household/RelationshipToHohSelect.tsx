import { Typography } from '@mui/material';
import { omit } from 'lodash-es';
import { useMemo } from 'react';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { HmisEnums } from '@/types/gqlEnums';
import { RelationshipToHoH } from '@/types/gqlTypes';

export type Option = { value: RelationshipToHoH; label: string };

interface Props
  extends Omit<GenericSelectProps<Option, false, false>, 'options' | 'value'> {
  value: RelationshipToHoH | null;
  showDataNotCollected?: boolean;
}

const RelationshipToHohSelect = ({
  disabled,
  value,
  showDataNotCollected = false,
  ...props
}: Props) => {
  const relationshipToHohOptions = useMemo(() => {
    const excluded = [RelationshipToHoH.SelfHeadOfHousehold];
    if (!showDataNotCollected)
      excluded.push(RelationshipToHoH.DataNotCollected);

    const filtered = omit(HmisEnums.RelationshipToHoH, excluded);
    const options = Object.entries(filtered).map(
      ([value, label]) =>
        ({
          value,
          label,
        } as Option)
    );
    return options;
  }, [showDataNotCollected]);

  // disabled if HoH is selected
  const isHoH = value === RelationshipToHoH.SelfHeadOfHousehold;
  const isDisabled = disabled || isHoH;

  if (isHoH) {
    return (
      <Typography variant='body2' sx={{ pl: 0.5 }}>
        Self
      </Typography>
    );
  }
  return (
    <GenericSelect<Option, false, false>
      options={relationshipToHohOptions}
      disabled={isDisabled}
      textInputProps={{
        placeholder: isHoH ? '(1) Self' : 'Select relationship',
      }}
      value={
        value && !isHoH
          ? relationshipToHohOptions.find((el) => el.value === value) || null
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
