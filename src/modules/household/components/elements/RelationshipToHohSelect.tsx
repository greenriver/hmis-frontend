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
  variant: 'includeHoh' | 'excludeHoh';
  value: RelationshipToHoH | null;
}

const relationshipOptions: Option[] = (
  localResolvePickList('RelationshipToHoH') || []
).map(({ code, label }) => ({
  value: code as RelationshipToHoH,
  label: label as string,
}));

const relationshipOptionsNoHoh: Option[] = relationshipOptions
  // Exclude HoH from option list
  .filter(({ value }) => value !== RelationshipToHoH.SelfHeadOfHousehold);

const RelationshipToHohSelect = ({
  value,
  textInputProps,
  variant = 'excludeHoh',
  ...props
}: Props) => {
  const isHoH = value === RelationshipToHoH.SelfHeadOfHousehold;

  const excludeHoh = variant === 'excludeHoh';

  if (isHoH && excludeHoh) {
    return (
      <Typography variant='body2' sx={{ pl: 0.5 }}>
        {HmisEnums.RelationshipToHoH[value]}
      </Typography>
    );
  }

  const options = excludeHoh ? relationshipOptionsNoHoh : relationshipOptions;

  return (
    <GenericSelect<Option, false, false>
      options={options}
      textInputProps={{ placeholder: 'Select Relationship', ...textInputProps }}
      value={options.find((el) => el.value === value) || null}
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
