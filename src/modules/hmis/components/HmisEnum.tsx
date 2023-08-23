import { Stack, Typography, TypographyProps } from '@mui/material';

import { isDataNotCollected } from '@/modules/form/util/formUtil';
import { INVALID_ENUM, MISSING_DATA_KEYS } from '@/modules/hmis/hmisUtil';

const getLabelAndColor = (
  enumMap: Record<string, string>,
  value?: any,
  noValue?: string
) => {
  let color: TypographyProps['color'] = 'text.primary';
  let label = enumMap[value];
  if (!label) {
    label = noValue || 'Not Specified';
    color = 'text.secondary';
  } else if (value === INVALID_ENUM) {
    color = 'error';
  } else if (isDataNotCollected(value) || MISSING_DATA_KEYS.includes(value)) {
    color = 'text.disabled';
  }
  return [label, color];
};
interface Props extends TypographyProps {
  value?: any;
  enumMap: Record<string, string>;
  noValue?: string;
}

/**
 * Render a single Enum value
 */
const HmisEnum = ({ value, enumMap, noValue, ...props }: Props) => {
  const [label, color] = getLabelAndColor(enumMap, value, noValue);
  return (
    <Typography variant='body2' color={color} {...props}>
      {label}
    </Typography>
  );
};

/**
 * Render multiple Enum values
 */
export const MultiHmisEnum = ({
  values,
  enumMap,
  noValue,
  oneRowPerValue = false,
  ...props
}: Omit<Props, 'value'> & { values: any[]; oneRowPerValue?: boolean }) => {
  if (oneRowPerValue && values.length > 1) {
    return (
      <Stack rowGap={0.5}>
        {values.map((val) => (
          <HmisEnum key={val} value={val} enumMap={enumMap} noValue={noValue} />
        ))}
      </Stack>
    );
  }
  let color = 'text.primary';
  let label = '';

  if (values.length <= 1) {
    const value = values[0];
    const [firstLabel, firstColor] = getLabelAndColor(enumMap, value, noValue);
    label = firstLabel;
    color = firstColor;
  } else {
    label = values
      .map((val) => enumMap[val])
      .filter(Boolean)
      .join(', ');
  }

  return (
    <Typography variant='body2' color={color} {...props}>
      {label}
    </Typography>
  );
};

export default HmisEnum;
