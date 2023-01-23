import { Stack, Typography, TypographyProps } from '@mui/material';

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

export const MultiHmisEnum = ({
  values,
  ...props
}: Omit<Props, 'value'> & { values: any[] }) => {
  return (
    <Stack direction='row' divider={<>,&nbsp;</>}>
      {values.map((val) => (
        <HmisEnum value={val} key={val} {...props} />
      ))}
    </Stack>
  );
};

export default HmisEnum;
