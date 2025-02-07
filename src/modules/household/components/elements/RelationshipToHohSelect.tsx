import { Typography } from '@mui/material';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { RelationshipToHoH } from '@/types/gqlTypes';

export type Option = { value: RelationshipToHoH; label: string };

export interface Props
  extends Omit<GenericSelectProps<Option, false, false>, 'options' | 'value'> {
  value: RelationshipToHoH | null;
}
const relationshipToHohOptions: Option[] = (
  localResolvePickList('RelationshipToHoH') || []
)
  .filter(({ code }) => code !== RelationshipToHoH.SelfHeadOfHousehold) // Exclude HoH from option list
  .map(({ code, label }) => ({
    value: code as RelationshipToHoH,
    label: label as string,
  }));

const RelationshipToHohSelect = ({
  disabled,
  value,
  textInputProps,
  ...props
}: Props) => {
  // disabled if HoH is selected
  const isHoH = value === RelationshipToHoH.SelfHeadOfHousehold;
  const isDisabled = disabled || isHoH;

  if (isHoH) {
    return (
      <Typography variant='body2' sx={{ pl: 0.5 }}>
        {HmisEnums.RelationshipToHoH[value]}
      </Typography>
    );
  }

  return (
    <GenericSelect<Option, false, false>
      options={relationshipToHohOptions}
      disabled={isDisabled}
      textInputProps={{ placeholder: 'Select Relationship', ...textInputProps }}
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
