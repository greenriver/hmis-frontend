import {
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { Stack, SxProps } from '@mui/system';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import theme from '@/config/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import FormSelect from '@/modules/form/components/FormSelect';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import CardGroup, {
  RemovableCard,
} from '@/modules/formBuilder/components/itemEditor/conditionals/CardGroup';
import {
  ActiveStatus,
  DataCollectedAbout,
  FormRuleInput,
  FundingSource,
  ItemType,
  PickListOption,
  PickListType,
  useCreateFormRuleMutation,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];

const projectTypePickList = localResolvePickList('ProjectType');
const funderPickList = localResolvePickList('FundingSource');

const conditionPickList: PickListOption[] = [
  { code: 'projectId', label: 'Project' },
  { code: 'projectType', label: 'Project Type' },
  { code: 'organizationId', label: 'Organization' },
  { code: 'funder', label: 'Funding Source' },
];

const defaultRule: FormRuleInput = {
  activeStatus: ActiveStatus.Active,
  dataCollectedAbout: DataCollectedAbout.AllClients,
};

// `otherFunder` is also a condition type, of a sort, but it's left off here because
// it's dependent on `funder` and it's a TextInput instead of a Select
type ConditionType = 'projectId' | 'projectType' | 'organizationId' | 'funder';

const FormRuleLabelTypography = ({
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
  open: boolean;
  onClose: VoidFunction;
  formId: string;
  formTitle: string;
}

const NewFormRuleDialog: React.FC<Props> = ({
  open,
  onClose,
  formId,
  formTitle,
}) => {
  const [rule, setRule] = useState<FormRuleInput>(defaultRule);

  const onCloseDialog = useCallback(() => {
    onClose();
    setRule(defaultRule); // clear out the form
  }, [onClose]);

  const [createFormRule, { loading, error }] = useCreateFormRuleMutation({
    variables: {
      input: { input: rule, definitionId: formId },
    },
    onCompleted: (data) => {
      if (data.createFormRule?.formRule) {
        onCloseDialog();
        // clear the cache so that applicability gets updated
        evictQuery('formDefinition', { id: formId }); // todo @martha - evict specifically projectMatches?
        evictQuery('formRules');
      }
    },
  });

  const conditions = useMemo(() => {
    return (
      [
        'projectType',
        'projectId',
        'organizationId',
        'funder',
      ] as ConditionType[]
    ).map((conditionType) => {
      return {
        conditionType: conditionType,
        value: rule[conditionType],
      };
    });
  }, [rule]);

  const conditionsAvailable: ConditionType[] = useMemo(
    () =>
      conditions
        .filter((condition) => !condition.value)
        .map((condition) => condition.conditionType),
    [conditions]
  );

  const { pickList: projectList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.Project,
    },
  });

  const { pickList: orgList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.Organization,
    },
  });

  const pickListMap: Record<ConditionType, PickListOption[]> = {
    projectType: projectTypePickList || [],
    funder: funderPickList || [],
    organizationId: orgList || [],
    projectId: projectList || [],
  };

  const isTiny = useIsMobile('sm');

  if (error) throw error;

  return (
    <CommonDialog
      open={open}
      fullWidth
      fullScreen={isTiny}
      onClose={onCloseDialog}
    >
      <DialogTitle>
        New rule for: <b>{formTitle}</b>
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} direction='row' sx={{ mt: 2, mb: 1, display: 'flex' }}>
          <FormRuleLabelTypography>Applies to</FormRuleLabelTypography>
          <FormSelect
            sx={{ flexGrow: 1 }}
            value={{
              code: rule.dataCollectedAbout || DataCollectedAbout.AllClients,
            }}
            options={dataCollectedAboutPickList}
            onChange={(_event, option) => {
              if (isPickListOption(option)) {
                setRule({
                  ...rule,
                  dataCollectedAbout: option.code as DataCollectedAbout,
                });
              }
            }}
          />
        </Stack>
        <CardGroup
          onAddItem={() => {
            if (conditionsAvailable.length > 0) {
              const conditionType = conditionsAvailable[0];
              const defaultValue = pickListMap[conditionType][0].code;
              // We display all conditions with a non-null value, so setting this condition's value
              // to some default value for its type (e.g. the first Project in the list) causes it to appear.
              setRule({ ...rule, [conditionType]: defaultValue });
            }
          }}
          addItemText='Add Condition'
          disableAdd={conditionsAvailable.length === 0}
        >
          {conditions
            .filter((condition) => !!condition.value)
            .map(({ conditionType, value }, index) => {
              return (
                <RemovableCard
                  key={conditionType}
                  onRemove={() => {
                    // setting this condition's value to undefined will remove it from the modal
                    setRule({ ...rule, [conditionType]: undefined });
                  }}
                  removeTooltip={'Remove Condition'}
                  sx={{
                    backgroundColor: theme.palette.grey[100],
                    border: 0,
                    py: 1,
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid item xs={2} sm={1}>
                      <FormRuleLabelTypography>
                        {index === 0 ? 'If' : 'And'}
                      </FormRuleLabelTypography>
                    </Grid>
                    <Grid item xs={9} sm={4}>
                      <FormSelect
                        disableClearable={true}
                        value={{ code: conditionType }}
                        options={conditionPickList}
                        onChange={(_event, option) => {
                          if (isPickListOption(option)) {
                            const newCondition = option.code as ConditionType;
                            setRule({
                              ...rule,
                              [conditionType]: undefined,
                              [option.code]: pickListMap[newCondition][0].code,
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
                        // disable clearing the input because we expect users to remove the whole condition
                        disableClearable={true}
                        value={value ? { code: value } : undefined}
                        options={pickListMap[conditionType]}
                        onChange={(_event, option) => {
                          if (isPickListOption(option)) {
                            setRule({ ...rule, [conditionType]: option.code });
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </RemovableCard>
              );
            })}

          {rule.funder === FundingSource.LocalOrOtherFundingSource && (
            <Card
              sx={{
                backgroundColor: theme.palette.grey[100],
                border: 0,
                px: 2,
                py: 1,
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <FormRuleLabelTypography>
                    And funding source is
                  </FormRuleLabelTypography>
                </Grid>
                <Grid item xs={8}>
                  <TextInput
                    value={rule.otherFunder || ''}
                    onChange={(e) =>
                      setRule({ ...rule, otherFunder: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Card>
          )}
        </CardGroup>
      </DialogContent>
      <DialogActions>
        <FormDialogActionContent
          submitButtonText='Create Rule'
          onSubmit={() => createFormRule()}
          onDiscard={onCloseDialog}
          submitLoading={loading}
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default NewFormRuleDialog;
