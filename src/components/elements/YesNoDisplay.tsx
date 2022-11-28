import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Stack, Typography, TypographyProps } from '@mui/material';
import React, { ReactElement } from 'react';

import { HmisEnums } from '@/types/gqlEnums';
import { NoYesReasonsForMissingData } from '@/types/gqlTypes';

interface Props extends TypographyProps {
  booleanValue?: boolean | null;
  enumValue?: NoYesReasonsForMissingData;
  fallback?: ReactElement;
}

const YesNoDisplay: React.FC<Props> = ({
  booleanValue,
  enumValue,
  fallback,
  ...props
}) => {
  let Icon;
  let text;
  if (booleanValue === true || enumValue === NoYesReasonsForMissingData.Yes) {
    Icon = CheckIcon;
    text = 'YES';
  } else if (
    booleanValue === false ||
    enumValue === NoYesReasonsForMissingData.No
  ) {
    Icon = CloseIcon;
    text = 'NO';
  } else if (enumValue) {
    text = HmisEnums.NoYesReasonsForMissingData[enumValue];
  }
  if (!text) return fallback || null;

  return (
    <Stack direction='row' gap={0.8}>
      {Icon && <Icon fontSize='small' sx={{ alignSelf: 'center' }} />}
      <Typography variant='body2' color='text.disabled' {...props}>
        {text}
      </Typography>
    </Stack>
  );
};

export default YesNoDisplay;
