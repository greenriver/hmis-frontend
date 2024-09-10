import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Stack, Typography, TypographyProps } from '@mui/material';
import React, { ReactElement } from 'react';

import { HmisEnums } from '@/types/gqlEnums';
import {
  DisabilityResponse,
  NoYesMissing,
  NoYesReasonsForMissingData,
} from '@/types/gqlTypes';

interface Props extends TypographyProps {
  booleanValue?: boolean | null;
  enumValue?:
    | NoYesMissing
    | NoYesReasonsForMissingData
    | DisabilityResponse
    | null;
  stringValue?: '0' | '1' | null;
  fallback?: ReactElement;
  showIcon?: boolean;
}

const YES_VALUES: string[] = [
  NoYesReasonsForMissingData.Yes,
  DisabilityResponse.AlcoholUseDisorder,
  DisabilityResponse.BothAlcoholAndDrugUseDisorders,
  DisabilityResponse.DrugUseDisorder,
];

const NO_VALUES: string[] = [
  NoYesReasonsForMissingData.No,
  DisabilityResponse.No,
];

const YesNoDisplay: React.FC<Props> = ({
  booleanValue,
  enumValue,
  stringValue,
  fallback,
  showIcon = false,
  ...props
}) => {
  let Icon;
  let text;
  if (
    booleanValue === true ||
    stringValue === '1' ||
    YES_VALUES.includes(enumValue as string)
  ) {
    Icon = CheckIcon;
    text = enumValue
      ? HmisEnums.DisabilityResponse[enumValue as DisabilityResponse] ||
        HmisEnums.NoYesReasonsForMissingData[
          enumValue as NoYesReasonsForMissingData
        ]
      : 'Yes';
  } else if (
    booleanValue === false ||
    stringValue === '0' ||
    NO_VALUES.includes(enumValue as string)
  ) {
    Icon = CloseIcon;
    text = 'No';
  } else if (enumValue) {
    text =
      HmisEnums.NoYesReasonsForMissingData[
        enumValue as NoYesReasonsForMissingData
      ] || enumValue;
  }
  if (!text) return fallback || null;

  return (
    <Stack direction='row' gap={0.8}>
      {showIcon && Icon && (
        <Icon fontSize='small' sx={{ alignSelf: 'center' }} />
      )}
      <Typography
        variant='body2'
        color={showIcon && Icon ? 'text.secondary' : 'text.primary'}
        {...props}
      >
        {text}
      </Typography>
    </Stack>
  );
};

export default YesNoDisplay;
