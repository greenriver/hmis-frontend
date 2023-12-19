import { Stack, Typography, TypographyProps } from '@mui/material';

import { ReactNode } from 'react';
import { isDataNotCollected } from '@/modules/form/util/formUtil';
import { INVALID_ENUM, MISSING_DATA_KEYS } from '@/modules/hmis/hmisUtil';

const getLabelAndColor = (enumMap: Record<string, string>, value?: any) => {
  let color: TypographyProps['color'] = 'text.primary';
  const label = enumMap[value];
  if (!label) {
    color = 'text.disabled';
  } else if (value === INVALID_ENUM) {
    color = 'error';
  } else if (isDataNotCollected(value) || MISSING_DATA_KEYS.includes(value)) {
    color = 'text.disabled';
  }
  return [label, color];
};

interface Props extends TypographyProps {
  value?: any; // enum value
  enumMap: Record<string, string>; // HmisEnum enum map
  noData?: ReactNode; // what to display if there is no value
}

/**
 * Render a single Enum value
 */
const HmisEnum = ({ value, enumMap, noData, ...props }: Props) => {
  const [label, color] = getLabelAndColor(enumMap, value);
  return (
    <Typography variant='body2' color={color} {...props}>
      {label || noData}
    </Typography>
  );
};

/**
 * Render multiple Enum values
 */
export const MultiHmisEnum = ({
  values,
  enumMap,
  noData,
  oneRowPerValue = false,
  children,
  ...props
}: Omit<Props, 'value'> & { values: any[]; oneRowPerValue?: boolean }) => {
  if (oneRowPerValue && values.length > 1) {
    return (
      <Stack rowGap={0.5}>
        {values.map((val) => (
          <HmisEnum key={val} value={val} enumMap={enumMap} noData={noData} />
        ))}
        {children}
      </Stack>
    );
  }
  let color = 'text.primary';
  let label = '';

  if (values.length <= 1) {
    const value = values[0];
    const [firstLabel, firstColor] = getLabelAndColor(enumMap, value);
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
      {label || noData}
    </Typography>
  );
};

export default HmisEnum;
