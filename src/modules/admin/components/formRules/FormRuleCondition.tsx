import { Grid, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import { startCase } from 'lodash-es';
import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ConditionType } from '@/modules/admin/components/formRules/NewFormRuleDialog';
import FormSelect from '@/modules/form/components/FormSelect';
import { isPickListOption } from '@/modules/form/types';
import { PickListOption } from '@/types/gqlTypes';

const FormRuleLabelTypography = ({
  sx,
  children,
}: {
  sx?: SxProps;
  children: ReactNode;
}) => (
  <Typography variant='body2' sx={{ py: 1, fontWeight: 600, ...sx }}>
    {children}
  </Typography>
);

interface Props {
  prefixText: string;
  joiningText?: string;
  index?: number;
  conditionType: ConditionType;
  conditionTypePickList: PickListOption[];
  setConditionType: (conditionType: ConditionType) => void;
  value: string | null;
  valuePickList: PickListOption[];
  setValue: (value: string) => void;
  valueError?: boolean;
}
const FormRuleCondition: React.FC<Props> = ({
  prefixText,
  index,
  conditionType,
  conditionTypePickList,
  setConditionType,
  value,
  valuePickList,
  setValue,
  joiningText = 'is',
  valueError = false,
}) => {
  const isTiny = useIsMobile('sm');
  const conditionTypeLabel = startCase(conditionType.replace(/Id$/, ''));

  return (
    <Grid container spacing={1} sx={{ alignItems: 'flex-end' }}>
      <Grid item xs={2} sm={1}>
        <FormRuleLabelTypography>{prefixText}</FormRuleLabelTypography>
      </Grid>
      <Grid item xs={9} sm={4}>
        <FormSelect
          label={index ? `Condition Type ${index}` : 'Condition Type'}
          disableClearable
          value={{ code: conditionType }}
          options={conditionTypePickList}
          onChange={(_, option) => {
            if (isPickListOption(option)) {
              setConditionType(option.code as ConditionType);
            }
          }}
        />
      </Grid>
      <Grid item xs={2} sm={1}>
        <FormRuleLabelTypography sx={isTiny ? {} : { textAlign: 'center' }}>
          {joiningText}
        </FormRuleLabelTypography>
      </Grid>
      <Grid item xs={10} sm={5}>
        <FormSelect
          error={valueError}
          label={conditionTypeLabel}
          value={value ? { code: value } : null}
          placeholder={`Select ${conditionTypeLabel}`}
          options={valuePickList}
          onChange={(_, option) => {
            if (isPickListOption(option)) {
              setValue(option.code);
            }
          }}
        />
      </Grid>
    </Grid>
  );
};

export default FormRuleCondition;
