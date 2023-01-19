import { Typography, TypographyProps } from '@mui/material';

import { isDataNotCollected } from '@/modules/form/util/formUtil';
import { INVALID_ENUM, MISSING_DATA_KEYS } from '@/modules/hmis/hmisUtil';

interface Props extends TypographyProps {
  value?: any;
  enumMap: Record<string, string>;
  noValue?: string;
}
const HmisEnum = ({ value, enumMap, noValue, ...props }: Props) => {
  let color: 'text.primary' | 'text.secondary' | 'error' = 'text.primary';

  let label = enumMap[value];
  if (!label) {
    label = noValue || 'Not Specified';
    color = 'text.secondary';
  } else if (value === INVALID_ENUM) {
    color = 'error';
  } else if (isDataNotCollected(value) || MISSING_DATA_KEYS.includes(value)) {
    color = 'text.secondary';
  }
  return (
    <Typography variant='body2' color={color} {...props}>
      {label}
    </Typography>
  );
};

export default HmisEnum;
