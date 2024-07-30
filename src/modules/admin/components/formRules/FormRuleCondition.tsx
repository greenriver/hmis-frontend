import { Grid, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import { startCase } from 'lodash-es';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import theme from '@/config/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ConditionType } from '@/modules/admin/components/formRules/NewFormRuleDialog';
import FormSelect from '@/modules/form/components/FormSelect';
import { isPickListOption } from '@/modules/form/types';
import { FormRuleInput, PickListOption } from '@/types/gqlTypes';

export const FormRuleLabelTypography = ({
                                   sx,
                                   children,
                                 }: {
  sx?: SxProps;
  children: ReactNode;
}) => (
  <Typography
    variant='body2'
    sx={{ pt: 1, fontWeight: theme.typography.fontWeightBold, ...sx }}
  >
    {children}
  </Typography>
);

interface Props {
  startLabel?: string;
  conditionType: ConditionType;
  conditionAriaLabel: string;
  conditionTypePickList: PickListOption[];
  setRule: Dispatch<SetStateAction<FormRuleInput>>;
  value?: string | null;
  valuePickList: PickListOption[];
  onChangeRule: (conditionType: ConditionType, option: PickListOption | PickListOption[] | null) => void;
  rule: FormRuleInput;
}

const FormRuleCondition: React.FC<Props> = ({
  startLabel,
  conditionAriaLabel,
  conditionType,
  conditionTypePickList,
  setRule,
  value,
  valuePickList,  // todo @martha - could be moved inside here
  onChangeRule,
  rule
}) => {
  const isTiny = useIsMobile('sm');


  return <Grid container spacing={1}>
    {startLabel && <Grid item xs={2} sm={1}>
      <FormRuleLabelTypography>
        {startLabel}
      </FormRuleLabelTypography>
    </Grid>}
    <Grid item xs={9} sm={4}>
      <FormSelect
        disableClearable
        value={{ code: conditionType }}
        options={conditionTypePickList}
        ariaLabel={conditionAriaLabel}
        onChange={(_event, option) => {
          if (isPickListOption(option)) {
            setRule({
              ...rule,
              [conditionType]: undefined,
              [option.code]: '',
            });
          }
        }}
      />
    </Grid>
    <Grid item xs={2} sm={1}>
      <FormRuleLabelTypography
        sx={isTiny ? {} : { textAlign: 'center' }}
      >
        is
      </FormRuleLabelTypography>
    </Grid>
    <Grid item xs={10} sm={5}>
      <FormSelect
        value={value ? { code: value } : null}
        placeholder={`Select ${startCase(
          conditionType.replace(/Id$/, '')
        )}`}
        ariaLabel={conditionTypePickList.find(c => c.code === conditionType)?.label}
        options={valuePickList}
        onChange={(_, option) =>
          onChangeRule(conditionType, option)
        }
      />
    </Grid>
  </Grid>
}

export default FormRuleCondition;
